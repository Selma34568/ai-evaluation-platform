from dotenv import load_dotenv
from langfuse import get_client

load_dotenv()

langfuse = get_client()

with langfuse.start_as_current_observation(
    as_type="span",
    name="evalai-first-test",
    input={"message": "Hello from EvalAI"}
) as span:
    span.update(output={"status": "success"})

langfuse.flush()

print("Trace sent successfully!")