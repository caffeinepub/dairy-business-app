import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  // ── Old Types (from previous canister version) ───────────────────────────────

  type OldUserProfile = {
    name : Text;
  };

  type OldCustomer = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    active : Bool;
  };

  type OldDeliveryRecord = {
    id : Nat;
    customerPrincipal : ?Principal;
    deliveryBoyName : Text;
    date : Time.Time;
    quantityLiters : Float;
    status : {
      #delivered;
      #missed;
    };
    notes : Text;
  };

  type OldMilkProductionRecord = {
    id : Nat;
    date : Time.Time;
    quantityLiters : Float;
    notes : Text;
  };

  type OldMilkRecord = {
    id : Nat;
    cattleId : Nat;
    date : Time.Time;
    quantityLiters : Float;
    notes : Text;
  };

  type OldCattleStatus = { #active; #inactive };

  type OldCattle = {
    id : Nat;
    breed : Text;
    ageMonths : Nat;
    dailyMilkProductionLiters : Float;
    healthStatus : OldHealthStatus;
    purchaseDate : Time.Time;
    purchaseCost : Float;
    notes : Text;
    status : OldCattleStatus;
  };

  type OldHealthStatus = {
    #healthy;
    #sick : {
      condition : Text;
      medications : [Text];
      treatment : Text;
    };
    #recovered;
  };

  type OldCustomerFeedback = {
    feedbackId : Nat;
    deliveryId : Nat;
    customerPrincipal : Principal;
    message : Text;
    timestamp : Time.Time;
    flagged : Bool;
    resolved : Bool;
  };

  // ── New Types (from new canister version) ────────────────────────────────────

  type NewUserProfile = {
    name : Text;
  };

  type NewHealthStatus = {
    #Healthy;
    #Sick;
    #Recovered;
  };

  type NewCattleAvailability = {
    #Available;
    #Sold;
    #Reserved;
  };

  type NewCattle = {
    id : Nat;
    tagNumber : Text;
    breed : Text;
    dateOfPurchase : Int;
    milkingCapacity : Float;
    purchasePrice : Float;
    availability : NewCattleAvailability;
    healthStatus : NewHealthStatus;
  };

  type NewCustomerAccount = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    username : Text;
    passwordHash : Text;
    isActive : Bool;
  };

  type NewOrderStatus = {
    #Pending;
    #Confirmed;
    #OutForDelivery;
    #Delivered;
    #Cancelled;
  };

  type NewCattleOrder = {
    orderId : Nat;
    customerId : Nat;
    cattleTagNumber : Text;
    orderDate : Int;
    status : NewOrderStatus;
    deliveryNotes : Text;
  };

  // ── Old Actor (previous canister version) ────────────────────────────────────

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    customers : Map.Map<Nat, OldCustomer>;
    deliveryRecords : Map.Map<Nat, OldDeliveryRecord>;
    milkProductionRecords : Map.Map<Nat, OldMilkProductionRecord>;
    cattleRecords : Map.Map<Nat, OldCattle>;
    milkRecords : Map.Map<Nat, OldMilkRecord>;
    feedbackRecords : Map.Map<Nat, OldCustomerFeedback>;
    nextCustomerId : Nat;
    nextDeliveryRecordId : Nat;
    nextMilkRecordId : Nat;
    nextCattleId : Nat;
    nextMilkRecordIdMain : Nat;
    nextFeedbackId : Nat;
  };

  // ── New Actor (new canister version) ─────────────────────────────────────────

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    cattleRecords : Map.Map<Nat, NewCattle>;
    customerAccounts : Map.Map<Nat, NewCustomerAccount>;
    orders : Map.Map<Nat, NewCattleOrder>;
    customerPrincipalMap : Map.Map<Nat, Principal>;
    nextCattleId : Nat;
    nextCustomerId : Nat;
    nextOrderId : Nat;
  };

  // ── Migration Function ───────────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    // Transform old state to new state, discarding unneeded data.
    {
      userProfiles = old.userProfiles;
      cattleRecords = Map.empty<Nat, NewCattle>();
      customerAccounts = Map.empty<Nat, NewCustomerAccount>();
      orders = Map.empty<Nat, NewCattleOrder>();
      customerPrincipalMap = Map.empty<Nat, Principal>();
      nextCattleId = 1;
      nextCustomerId = 1;
      nextOrderId = 1;
    };
  };
};
