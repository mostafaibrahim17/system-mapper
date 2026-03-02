from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import json

app = FastAPI()

app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],  # For demo purposes; tighten for production
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

client = OpenAI(
   api_key=os.environ.get("RELAXAI_API_KEY"),
   base_url="https://api.relax.ai/v1"
)

class ArchitectureNotes(BaseModel):
   notes: str

class SystemMap(BaseModel):
   nodes: list
   edges: list

EXTRACTION_PROMPT = """
You are a system architecture extraction engine.

STRICT REQUIREMENTS:
- OUTPUT ONLY JSON.
- NO explanation.
- NO natural language.
- NO markdown.
- NO code fences (no ```json or ```).
- NO commentary.
- If unsure about a component or relationship, omit it.

Extract system components (nodes) and their relationships (edges) from the architecture notes.

REQUIRED JSON FORMAT (follow EXACTLY):
{
 "nodes": [
   {
     "id": "unique-component-id",
     "label": "Component Name",
     "team": "Team Name",
     "type": "service",
     "description": "Brief description"
   }
 ],
 "edges": [
   {
     "source": "component-id-1",
     "target": "component-id-2",
     "relationship": "calls"
   }
 ]
}
"""

@app.get("/health")
def health_check():
   return {"status": "healthy"}

@app.post("/map", response_model=SystemMap)
async def generate_map(input_data: ArchitectureNotes):
   if not input_data.notes or len(input_data.notes.strip()) < 10:
       raise HTTPException(
           status_code=400,
           detail="Notes must contain at least 10 characters"
       )
   try:
       response = client.chat.completions.create(
           model="Llama-4-Maverick-17B-128E",
           messages=[
               {
                   "role": "system",
                   "content": "You are a precise system architecture analyzer. Return only valid JSON."
               },
               {
                   "role": "user",
                   "content": EXTRACTION_PROMPT + input_data.notes
               }
           ],
           temperature=0.3,
           max_tokens=2000
       )
       llm_output = response.choices[0].message.content.strip()
       if llm_output.startswith("```json"):
           llm_output = llm_output.split("```json")[1].split("```\n")[0].strip()
       elif llm_output.startswith("```"):
           llm_output = llm_output.split("```\n")[1].split("```\n")[0].strip()
       system_map = json.loads(llm_output)
       if "nodes" not in system_map or "edges" not in system_map:
           raise ValueError("LLM output missing required fields: nodes, edges")
       return SystemMap(**system_map)
   except json.JSONDecodeError as e:
       raise HTTPException(
           status_code=500,
           detail=f"LLM returned invalid JSON: {str(e)}"
       )
   except Exception as e:
       raise HTTPException(
           status_code=500,
           detail=f"Error generating map: {str(e)}"
       )

if __name__ == "__main__":
   import uvicorn
   uvicorn.run(app, host="0.0.0.0", port=8000)
