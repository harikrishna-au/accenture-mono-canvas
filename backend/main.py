import os
import sys

# Global Debug Tracker
import_status = {}

try:
    from dotenv import load_dotenv
    load_dotenv()
    import_status["dotenv"] = "Success"
except ImportError:
    
    import_status["dotenv"] = "Not Installed"
except Exception as e:
    import_status["dotenv"] = f"Failed: {e}"

def safe_import(module_name, alias=None):
    try:
        mod = __import__(module_name)
        import_status[module_name] = "Success"
        return mod
    except ImportError as e:
        import_status[module_name] = f"Failed: {e}"
        return None
    except Exception as e:
        import_status[module_name] = f"Crash: {e}"
        return None

# --- CRITICAL IMPORTS ---
try:
    from fastapi import FastAPI, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from mangum import Mangum
    import_status["fastapi_core"] = "Success"
except Exception as e:
    import_status["fastapi_core"] = f"CRITICAL FAILURE: {e}"
    # Minimal fallback to avoid total 502 (if possible)
    FastAPI = None

# --- OPTIONAL IMPORTS (Wrap them) ---
pypdf = safe_import("pypdf")
boto3 = safe_import("boto3")
openai = safe_import("openai")
slowapi = safe_import("slowapi")

# Initialize App (Defensive)
if FastAPI:
    app = FastAPI()

    # Configure explicit allowed origins to satisfy CORS when credentials are used
    default_origins = "http://localhost:5173,http://localhost:3000,http://localhost:8081,https://www.harrytheblaze.site"
    origins = os.getenv("ALLOWED_ORIGINS", default_origins).split(",")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def read_root():
        return {"status": "online", "message": "Communication Backend (Debug Mode)", "imports": import_status}

    @app.get("/api/debug/status")
    def debug_status():
        return {
            "status": "online",
            "imports": import_status,
            "sys_path": sys.path
        }

    # Handler
    handler = Mangum(app)

else:
    # If FastAPI missing, we are doomed, but try to return a lambda handler that prints error
    def handler(event, context):
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*"
            },
            "body": f"FATAL STARTUP ERROR: {import_status}" 
        }

# --- ATTEMPT ROTUER LOAD ---
# Only if imports succeeded
router_status = {}

if FastAPI:
    def safe_include_router(module_name):
        try:
            # Try imports
            try:
                module = __import__(f"backend.routers.{module_name}", fromlist=["router"])
            except ImportError:
                module = __import__(f"routers.{module_name}", fromlist=["router"])
            
            app.include_router(module.router)
            router_status[module_name] = "Loaded"
        except Exception as e:
            router_status[module_name] = f"Failed: {e}"

    # Try loading routers
    safe_include_router("misc")
    safe_include_router("resume")
    safe_include_router("interview")
    safe_include_router("game")

    # Add router status to debug endpoint
    @app.get("/api/debug/routers")
    def router_debug():
        return router_status
