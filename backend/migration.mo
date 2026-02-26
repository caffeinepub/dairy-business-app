import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type Customer = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    active : Bool;
  };

  type LegacyDeliveryRecord = {
    id : Nat;
    customerId : Nat;
    deliveryBoyName : Text;
    date : Time.Time;
    quantityLiters : Float;
    status : { #delivered; #missed };
    notes : Text;
  };

  type DeliveryRecord = {
    id : Nat;
    customerPrincipal : ?Principal;
    deliveryBoyName : Text;
    date : Time.Time;
    quantityLiters : Float;
    status : { #delivered; #missed };
    notes : Text;
  };

  type OldActor = {
    customers : Map.Map<Nat, Customer>;
    deliveryRecords : Map.Map<Nat, LegacyDeliveryRecord>;
    milkProductionRecords : Map.Map<Nat, { id : Nat; date : Time.Time; quantityLiters : Float; notes : Text }>;
    cattleRecords : Map.Map<Nat, { id : Nat; breed : Text; ageMonths : Nat; dailyMilkProductionLiters : Float; healthStatus : { #healthy; #sick : { condition : Text; medications : [Text]; treatment : Text }; #recovered }; purchaseDate : Time.Time; purchaseCost : Float; notes : Text; status : { #active; #inactive } }>;
    milkRecords : Map.Map<Nat, { id : Nat; cattleId : Nat; date : Time.Time; quantityLiters : Float; notes : Text }>;
    nextCustomerId : Nat;
    nextDeliveryRecordId : Nat;
    nextMilkRecordId : Nat;
    nextCattleId : Nat;
    nextMilkRecordIdMain : Nat;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewActor = {
    customers : Map.Map<Nat, Customer>;
    deliveryRecords : Map.Map<Nat, DeliveryRecord>;
    milkProductionRecords : Map.Map<Nat, { id : Nat; date : Time.Time; quantityLiters : Float; notes : Text }>;
    cattleRecords : Map.Map<Nat, { id : Nat; breed : Text; ageMonths : Nat; dailyMilkProductionLiters : Float; healthStatus : { #healthy; #sick : { condition : Text; medications : [Text]; treatment : Text }; #recovered }; purchaseDate : Time.Time; purchaseCost : Float; notes : Text; status : { #active; #inactive } }>;
    milkRecords : Map.Map<Nat, { id : Nat; cattleId : Nat; date : Time.Time; quantityLiters : Float; notes : Text }>;
    feedbackRecords : Map.Map<Nat, {
      feedbackId : Nat;
      deliveryId : Nat;
      customerPrincipal : Principal;
      message : Text;
      timestamp : Time.Time;
      flagged : Bool;
      resolved : Bool;
    }>;
    nextCustomerId : Nat;
    nextDeliveryRecordId : Nat;
    nextMilkRecordId : Nat;
    nextCattleId : Nat;
    nextMilkRecordIdMain : Nat;
    nextFeedbackId : Nat;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newDeliveryRecords = old.deliveryRecords.map<Nat, LegacyDeliveryRecord, DeliveryRecord>(
      func(_id, oldRecord) {
        { oldRecord with customerPrincipal = null };
      }
    );

    {
      old with
      deliveryRecords = newDeliveryRecords;
      feedbackRecords = Map.empty<Nat, {
        feedbackId : Nat;
        deliveryId : Nat;
        customerPrincipal : Principal;
        message : Text;
        timestamp : Time.Time;
        flagged : Bool;
        resolved : Bool;
      }>();
      nextFeedbackId = 1;
    };
  };
};
