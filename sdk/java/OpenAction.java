import java.time.Instant;
import java.util.*;
public final class OpenAction {
  public static final String VERSION="1.0-rc1";
  private static final Set<String> RISKS=Set.of("low","medium","high","critical");
  private static final Map<String,Set<String>> TRANSITIONS=Map.of("proposed",Set.of("ready","cancelled"),"ready",Set.of("approved","cancelled","expired"),"approved",Set.of("executing","cancelled","expired"),"executing",Set.of("succeeded","failed"),"succeeded",Set.of(),"failed",Set.of(),"cancelled",Set.of(),"expired",Set.of());
  private OpenAction(){}
  public record Actor(String type,String id,String displayName){}
  public record Evidence(String id,String kind,String source,String locator){}
  public record Approval(boolean required,String mode,String status,String receiptId){}
  public record Action(String openaction,String id,String kind,String label,String status,String reason,Actor actor,List<Evidence> evidence,String risk,List<Map<String,Object>> permissions,Approval approval,String createdAt){}
  public static Action create(String kind,String label,String reason,String risk,List<Evidence> evidence){if(kind==null||!kind.contains("."))throw new IllegalArgumentException("namespaced kind required");if(!RISKS.contains(risk))throw new IllegalArgumentException("invalid risk");boolean high=risk.equals("high")||risk.equals("critical");Approval approval=new Approval(high,high?"qualified_human":"none",high?"pending":"not_required",null);return new Action(VERSION,"oa_"+UUID.randomUUID(),kind,label,"proposed",reason,new Actor("service","local",null),List.copyOf(evidence),risk,List.of(),approval,Instant.now().toString());}
  public static List<String> validate(Action a){List<String> e=new ArrayList<>();if(!VERSION.equals(a.openaction()))e.add("openaction must be 1.0-rc1");if(a.evidence()==null||a.evidence().isEmpty())e.add("evidence required");if((a.risk().equals("high")||a.risk().equals("critical"))&&(!a.approval().required()||!(a.approval().mode().equals("human")||a.approval().mode().equals("qualified_human"))))e.add("high/critical requires human approval");return e;}
  public static String transition(String current,String next){if(!TRANSITIONS.getOrDefault(current,Set.of()).contains(next))throw new IllegalArgumentException("invalid transition "+current+" -> "+next);return next;}
}
