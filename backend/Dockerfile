FROM public.ecr.aws/lambda/python:3.11

# 1. Copy requirements to the Task Root
# We copy from the build context (assumed to be project root)
COPY backend/requirements.txt ${LAMBDA_TASK_ROOT}/requirements.txt

# 2. Install dependencies
RUN pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt

# 3. Copy the entire backend directory into the Task Root under 'backend/'
# This ensures imports like 'from backend.data import...' continue to work
COPY backend/ ${LAMBDA_TASK_ROOT}/backend/

# 4. Set the CMD to your handler (Package.Module.Function)
CMD [ "backend.main.handler" ]
