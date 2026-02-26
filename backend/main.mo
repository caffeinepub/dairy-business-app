import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration to clear admin principals

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

  public type MilkProductionRecord = {
    id : Nat;
    cattleTag : Text;
    quantityLiters : Float;
    date : Int;
    notes : Text;
    addedBy : Principal;
  };

  public type InventoryItem = {
    id : Nat;
    name : Text;
    category : Text;
    quantity : Float;
    unit : Text;
    lowStockThreshold : Float;
    notes : Text;
    addedBy : Principal;
  };

  public type InventoryStats = {
    totalItems : Nat;
    lowStockItems : Nat;
    categoryCount : Nat;
  };

  public type InventoryStat = {
    totalRecords : Nat;
    totalQuantity : Float;
    avgDailyProduction : Float;
    uniqueCattleCount : Nat;
  };

  // ─── State ────────────────────────────────────────────────────────────────

  let userProfiles = Map.empty<Principal, UserProfile>();
  let cattleRecords = Map.empty<Nat, Cattle>();
  let customerAccounts = Map.empty<Nat, CustomerAccount>();
  let orders = Map.empty<Nat, CattleOrder>();
  let customerPrincipalMap = Map.empty<Nat, Principal>();
  let inventoryItems = Map.empty<Nat, InventoryItem>();
  let milkProductionRecords = Map.empty<Nat, MilkProductionRecord>();

  var nextCattleId : Nat = 1;
  var nextCustomerId : Nat = 1;
  var nextOrderId : Nat = 1;
  var nextInventoryId : Nat = 1;
  var nextMilkRecordId : Nat = 1;

  // Stores up to 2 admin principals for auto-registration
  let adminPrincipals = Map.empty<Principal, Bool>();

  // ─── First Two Non-Anonymous Callers Become Admins ─────────────────────────
  // Uses AccessControl.initialize to bootstrap admin access without requiring
  // an existing admin, since assignRole has an internal admin-only guard.
  public shared ({ caller }) func adminLogin(adminToken : Text, userProvidedToken : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot be granted admin access");
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return;
    };

    if (adminPrincipals.size() >= 2) {
      Runtime.trap("Admin slots are full: up to 2 admin principals are supported");
    };

    adminPrincipals.add(caller, true);

    // Use initialize to bootstrap the first two admins without requiring
    // an existing admin caller (assignRole has an internal admin-only guard).
    AccessControl.initialize(
      accessControlState,
      caller,
      adminToken,
      userProvidedToken,
    );
  };

  // ─── User Profile ─────────────────────────────────────────────────────────
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

  // ─── Cattle CRUD (admin-only) ─────────────────────────────────────────────
  public shared ({ caller }) func addCattle(
    tagNumber : Text,
    breed : Text,
    dateOfPurchase : Int,
    purchasePrice : Float,
    availability : CattleAvailability,
    healthStatus : HealthStatus,
  ) {
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
      purchasePrice;
      availability;
      healthStatus;
    };
    cattleRecords.add(id, newCattle);
  };

  public shared ({ caller }) func updateCattle(
    cattleId : Nat,
    tagNumber : Text,
    breed : Text,
    dateOfPurchase : Int,
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
  ) {
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
      case (?_) {
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

  // ─── Order Management ─────────────────────────────────────────────────---
  public shared ({ caller }) func placeOrder(
    customerId : Nat,
    cattleTagNumber : Text,
    deliveryNotes : Text,
  ) {
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

  // ─── Inventory Management ─────────────────────────────────────────────────
  public shared ({ caller }) func addInventoryItem(
    name : Text,
    category : Text,
    quantity : Float,
    unit : Text,
    lowStockThreshold : Float,
    notes : Text,
  ) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add inventory items");
    };
    let id = nextInventoryId;
    nextInventoryId += 1;
    let newItem : InventoryItem = {
      id;
      name;
      category;
      quantity;
      unit;
      lowStockThreshold;
      notes;
      addedBy = caller;
    };
    inventoryItems.add(id, newItem);
  };

  public shared ({ caller }) func updateInventoryItem(
    itemId : Nat,
    name : Text,
    category : Text,
    quantity : Float,
    unit : Text,
    lowStockThreshold : Float,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update inventory items");
    };
    switch (inventoryItems.get(itemId)) {
      case (null) { Runtime.trap("Inventory item not found") };
      case (?existing) {
        let updated : InventoryItem = {
          id = itemId;
          name;
          category;
          quantity;
          unit;
          lowStockThreshold;
          notes;
          addedBy = existing.addedBy;
        };
        inventoryItems.add(itemId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteInventoryItem(itemId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete inventory items");
    };
    switch (inventoryItems.get(itemId)) {
      case (null) { Runtime.trap("Inventory item not found") };
      case (?_) {
        inventoryItems.remove(itemId);
      };
    };
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view inventory items");
    };
    inventoryItems.values().toArray();
  };

  public query ({ caller }) func getLowStockItems() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view low stock items");
    };
    let lowStock = inventoryItems.values().toArray().filter(
      func(item : InventoryItem) : Bool {
        item.quantity <= item.lowStockThreshold;
      }
    );
    lowStock;
  };

  public query ({ caller }) func getInventoryStats() : async InventoryStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view inventory stats");
    };
    let items = inventoryItems.values().toArray();
    let lowStockCount = items.filter(
      func(item : InventoryItem) : Bool {
        item.quantity <= item.lowStockThreshold;
      }
    ).size();
    let categoryCount = items.map(func(item : InventoryItem) : Text { item.category }).size();
    {
      totalItems = inventoryItems.size();
      lowStockItems = lowStockCount;
      categoryCount;
    };
  };

  // ─── Milk Production Tracking ─────────────────────────────────────────────
  public shared ({ caller }) func addMilkProductionRecord(
    cattleTag : Text,
    quantityLiters : Float,
    date : Int,
    notes : Text,
  ) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add milk production records");
    };
    let id = nextMilkRecordId;
    nextMilkRecordId += 1;
    let record : MilkProductionRecord = {
      id;
      cattleTag;
      quantityLiters;
      date;
      notes;
      addedBy = caller;
    };
    milkProductionRecords.add(id, record);
  };

  public shared ({ caller }) func updateMilkProductionRecord(
    recordId : Nat,
    cattleTag : Text,
    quantityLiters : Float,
    date : Int,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update milk production records");
    };
    switch (milkProductionRecords.get(recordId)) {
      case (null) { Runtime.trap("Milk production record not found") };
      case (?existing) {
        let updated : MilkProductionRecord = {
          id = recordId;
          cattleTag;
          quantityLiters;
          date;
          notes;
          addedBy = existing.addedBy;
        };
        milkProductionRecords.add(recordId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteMilkProductionRecord(recordId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete milk production records");
    };
    switch (milkProductionRecords.get(recordId)) {
      case (null) { Runtime.trap("Milk production record not found") };
      case (?_) {
        milkProductionRecords.remove(recordId);
      };
    };
  };

  public query ({ caller }) func getAllMilkProductionRecords() : async [MilkProductionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view milk production records");
    };
    milkProductionRecords.values().toArray();
  };

  public query ({ caller }) func getMilkProductionStats() : async InventoryStat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view milk production stats");
    };
    if (milkProductionRecords.isEmpty()) {
      return {
        totalRecords = 0;
        totalQuantity = 0.0;
        avgDailyProduction = 0.0;
        uniqueCattleCount = 0;
      };
    };

    let records = milkProductionRecords.values().toArray();
    let totalQuantity = records.foldLeft(
      0.0,
      func(acc : Float, record : MilkProductionRecord) : Float { acc + record.quantityLiters },
    );

    let dates = records.map(func(r : MilkProductionRecord) : Int { r.date });
    let minDate = dates.foldLeft(
      dates[0],
      func(min : Int, date : Int) : Int { if (date < min) { date } else { min } },
    );
    let maxDate = dates.foldLeft(
      dates[0],
      func(max : Int, date : Int) : Int { if (date > max) { date } else { max } },
    );

    let days = if (maxDate != minDate) {
      ((maxDate - minDate) / 86400_000_000_000).toNat();
    } else { 1 };

    let uniqueCattleCount = records.map(func(record : MilkProductionRecord) : Text { record.cattleTag }).size();

    {
      totalRecords = records.size();
      totalQuantity;
      avgDailyProduction = totalQuantity / days.toFloat();
      uniqueCattleCount;
    };
  };
};

