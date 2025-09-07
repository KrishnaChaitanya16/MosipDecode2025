from pydantic import BaseModel
from typing import Dict

class VerificationRequest(BaseModel):
    submittedData: Dict[str, str]
