"""PlanRHAPI.database package initializer.

Creating this file ensures the `database` directory is treated as a Python package
when the app runs inside Docker. This makes imports like `from database.database import db`
work reliably across different Python import path behaviors.
"""

from .database import *
