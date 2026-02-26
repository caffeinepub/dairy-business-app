import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Types ───────────────────────────────────────────────────────────────

  public type UserProfile = {
    name : Text;
  };

  public type HealthStatus = {
    #Healthy;
    #Sick;
    #Recovered;
  };

  public type CattleAvailability = {
    #Available;
    #Sold;
    #Reserved;
  };

  public type Cattle = {
    id : Nat;
    tagNumber : Text;
    breed : Text;
    dateOfPurchase : Int;
    milkingCapacity : Float;
    purchasePrice : Float;
    availability : CattleAvailability;
    healthStatus : HealthStatus;
  };

  public type CustomerAccount = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    username : Text;
    passwordHash : Text;
    isActive : Bool;
  };

  public type OrderStatus = {
    #Pending;
    #Confirmed;
    #OutForDelivery;
    #Delivered;
    #Cancelled;
  };

  public type CattleOrder = {
    orderId : Nat;
    customerId : Nat;
    cattleTagNumber : Text;
    orderDate : Int;
    status : OrderStatus;
    deliveryNotes : Text;
  };

  public type LoginResult = {
    #ok : Text;
    #err : LoginError;
  };

  public type LoginError = {
    #InvalidCredentials;
    #AccountInactive;
    #AccountNotFound;
    #AccessDenied;
  };

  // ─── State ────────────────────────────────────────────────────────────────

  let userProfiles = Map.empty<Principal, UserProfile>();
  let cattleRecords = Map.empty<Nat, Cattle>();
  let customerAccounts = Map.empty<Nat, CustomerAccount>();
  let orders = Map.empty<Nat, CattleOrder>();
  let customerPrincipalMap = Map.empty<Nat, Principal>();

  var nextCattleId : Nat = 1;
  var nextCustomerId : Nat = 1;
  var nextOrderId : Nat = 1;

  // ─── User Profile ─────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Cattle CRUD (admin-only) ───────────────────────────────────────────────
  public shared ({ caller }) func addCattle(
    tagNumber : Text,
    breed : Text,
    dateOfPurchase : Int,
    milkingCapacity : Float,
    purchasePrice : Float,
    availability : CattleAvailability,
    healthStatus : HealthStatus,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add cattle records");
    };
    let id = nextCattleId;
    nextCattleId += 1;
    let newCattle : Cattle = {
      id;
      tagNumber;
      breed;
      dateOfPurchase;
      milkingCapacity;
      purchasePrice;
      availability;
      healthStatus;
    };
    cattleRecords.add(id, newCattle);
    id;
  };

  public shared ({ caller }) func updateCattle(
    cattleId : Nat,
    tagNumber : Text,
    breed : Text,
    dateOfPurchase : Int,
    milkingCapacity : Float,
    purchasePrice : Float,
    availability : CattleAvailability,
    healthStatus : HealthStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update cattle records");
    };
    switch (cattleRecords.get(cattleId)) {
      case (null) { Runtime.trap("Cattle record not found") };
      case (?_) {
        let updated : Cattle = {
          id = cattleId;
          tagNumber;
          breed;
          dateOfPurchase;
          milkingCapacity;
          purchasePrice;
          availability;
          healthStatus;
        };
        cattleRecords.add(cattleId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCattle(cattleId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete cattle records");
    };
    switch (cattleRecords.get(cattleId)) {
      case (null) { Runtime.trap("Cattle record not found") };
      case (?_) {
        cattleRecords.remove(cattleId);
      };
    };
  };

  public query ({ caller }) func getAllCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray();
  };

  // ─── Customer Account CRUD (admin-only) ─────────────────────────────────---
  public shared ({ caller }) func addCustomer(
    name : Text,
    phone : Text,
    address : Text,
    username : Text,
    passwordHash : Text,
    isActive : Bool,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add customers");
    };
    for (c in customerAccounts.values()) {
      if (c.username == username) {
        Runtime.trap("Username already exists");
      };
    };
    let id = nextCustomerId;
    nextCustomerId += 1;
    let newCustomer : CustomerAccount = {
      id;
      name;
      phone;
      address;
      username;
      passwordHash;
      isActive;
    };
    customerAccounts.add(id, newCustomer);
    id;
  };

  public shared ({ caller }) func updateCustomer(
    customerId : Nat,
    name : Text,
    phone : Text,
    address : Text,
    username : Text,
    passwordHash : Text,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update customers");
    };
    switch (customerAccounts.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?existing) {
        for (c in customerAccounts.values()) {
          if (c.username == username and c.id != customerId) {
            Runtime.trap("Username already exists");
          };
        };
        let updated : CustomerAccount = {
          id = customerId;
          name;
          phone;
          address;
          username;
          passwordHash;
          isActive;
        };
        customerAccounts.add(customerId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(customerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };
    switch (customerAccounts.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?_) {
        customerAccounts.remove(customerId);
      };
    };
  };

  public shared ({ caller }) func setCustomerActive(customerId : Nat, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change customer active status");
    };
    switch (customerAccounts.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?existing) {
        let updated : CustomerAccount = { existing with isActive };
        customerAccounts.add(customerId, updated);
      };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [CustomerAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    customerAccounts.values().toArray();
  };

  // ─── Customer Authentication (public) ─────────────────────────────────--------
  public query func customerLogin(username : Text, password : Text) : async LoginResult {
    var found : ?CustomerAccount = null;
    for (c in customerAccounts.values()) {
      if (c.username == username) {
        found := ?c;
      };
    };
    switch (found) {
      case (null) { #err(#AccountNotFound) };
      case (?account) {
        if (not account.isActive) {
          return #err(#AccountInactive);
        };
        if (account.passwordHash != password) {
          return #err(#InvalidCredentials);
        };
        #ok("session-" # account.id.toText());
      };
    };
  };

  public query ({ caller }) func adminLogin() : async LoginResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err(#AccessDenied);
    };
    #ok("admin-session-" # caller.toText());
  };

  // ─── Order Management ─────────────────────────────────────────────────---
  public shared ({ caller }) func placeOrder(
    customerId : Nat,
    cattleTagNumber : Text,
    deliveryNotes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    switch (customerPrincipalMap.get(customerId)) {
      case (null) {
        Runtime.trap("Unauthorized: No customer account linked to your principal");
      };
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("Unauthorized: You can only place orders for your own account");
        };
      };
    };
    switch (customerAccounts.get(customerId)) {
      case (null) { Runtime.trap("Customer account not found") };
      case (?account) {
        if (not account.isActive) {
          Runtime.trap("Customer account is inactive");
        };
      };
    };
    let orderId = nextOrderId;
    nextOrderId += 1;
    let newOrder : CattleOrder = {
      orderId;
      customerId;
      cattleTagNumber;
      orderDate = Time.now();
      status = #Pending;
      deliveryNotes;
    };
    orders.add(orderId, newOrder);
    orderId;
  };

  public shared ({ caller }) func linkCustomerPrincipal(customerId : Nat, customerPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can link customer principals");
    };
    switch (customerAccounts.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?_) {
        customerPrincipalMap.add(customerId, customerPrincipal);
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : Nat,
    status : OrderStatus,
    deliveryNotes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?existing) {
        let updated : CattleOrder = { existing with status; deliveryNotes };
        orders.add(orderId, updated);
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [CattleOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getMyOrders() : async [CattleOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    let myOrders = orders.values().toArray().filter(
      func(o : CattleOrder) : Bool {
        switch (customerPrincipalMap.get(o.customerId)) {
          case (?owner) { owner == caller };
          case (null) { false };
        };
      }
    );
    myOrders;
  };
};
