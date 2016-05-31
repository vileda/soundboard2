package soundboard;

import lombok.Value;

import java.util.List;
import java.util.Map;
import java.util.Set;


@Value
public class SoundfileResponse {
  private final Set<Map.Entry<String, List<String>>> items;

  public SoundfileResponse(Map<String, List<String>> soundfiles) {

    this.items = soundfiles.entrySet();
  }
}
