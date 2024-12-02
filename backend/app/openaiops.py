import openai
from openai import OpenAI
from fastapi import HTTPException
from config import coverletter_defaultprompt, resumegeneration_defaultprompt

async def call_openai(api_key, model, messages, max_tokens=3000, temperature=0.7):
    try:
        openai_client = OpenAI(api_key=api_key)
        response = openai_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content.strip()
    
    except openai.UnprocessableEntityError as e:
        print(f"Invalid request error: {str(e)}")
        raise HTTPException(status_code=500, detail="The request to OpenAI was invalid. Please check the input format and content.")
    
    except openai.APIConnectionError as e:
        print(f"API connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="There was an issue connecting to the OpenAI API. Please try again later.")
    
    except openai.RateLimitError as e:
        print(f"Rate limit exceeded: {str(e)}")
        raise HTTPException(status_code=400, detail="Rate limit exceeded. Please wait and try again after some time.")
    
    except openai.AuthenticationError as e:
        print(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=401, detail="OpenAI key is not valid")
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected Error occurred")

async def generate_cover_letterai(api_key, resume_markdown, job_description, ai_model, systemcontent):
    messages = [
        {
            "role": "system",
            "content": systemcontent
        },
        {
            "role": "user",
            "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description}\n\nCover Letter:"
        }
    ]
    return await call_openai(api_key, ai_model, messages)

async def generate_answer(api_key, resume_markdown, job_description, ai_model, question):
    messages = [
        {
            "role": "system",
            "content": "You are an expert job candidate. Provide a well-structured answer to the employer's question based on the candidate's resume and job description. It should look human written. Keep it short and concise."
        },
        {
            "role": "user",
            "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description}\n\nEmployer's Question:\n{question}\n\nAnswer:"
        }
    ]
    return await call_openai(api_key, ai_model, messages)

async def update_markdown_with_openai(api_key, resume_markdown, job_description, ai_model, systemcontent):
    messages = [
        {
            "role": "system",
            "content": systemcontent
        },
        {
            "role": "user",
            "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description}\n\nUpdated Resume:"
        }
    ]
    return await call_openai(api_key, ai_model, messages)

async def update_markdown_from_prompt(api_key, resume_markdown, job_description, user_prompt, ai_model):
    messages = [
        {
            "role": "system",
            "content": "You are an expert resume writer. Update the following resume based on the Improvement prompt instructions given to better fit the given job description. Maintain the structure and content of the original resume as much as possible. Don't reduce the size of content much. Don't fake any experience or skills that the original resume doesn't have. Making it ATS friendly according to the job description is our goal. Just give me resume content; don't add any info text from your side. It should look human written."
        },
        {
            "role": "user",
            "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description} \n\nImprovement Prompt instructions: {user_prompt} \n\nUpdated Resume:"
        }
    ]
    return await call_openai(api_key, ai_model, messages)

async def check_relevancy(api_key, job_description, updated_markdown, ai_model):
    messages = [
        {
            "role": "system",
            "content": "You are a resume relevancy checker. Analyze the resume against the job description and provide a relevancy score along with a brief summary. Respond in the following JSON format: {\"score\": \"Relevant\", \"summary\": \"Your resume matches the job description closely.\"}"
        },
        {
            "role": "user",
            "content": f"Job Description:\n{job_description}\n\nUpdated Resume:\n{updated_markdown}\n\nProvide a relevancy score (Not Relevant, Little Relevant, Relevant, Very Relevant) and a short summary in the specified JSON format:"
        }
    ]
    return await call_openai(api_key, ai_model, messages)