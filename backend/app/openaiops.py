import openai
from openai import OpenAI
from fastapi import HTTPException

def generate_cover_letterai(api_key, resume_markdown, job_description,ai_model):
    try:
        openai_client = OpenAI(api_key=api_key)
        
        # Function to generate cover letter
        messages = [
            {
                "role": "system",
                "content": "You are a professional cover letter writer. Generate a cover letter based on the resume and job description. Keep it concise. Dont use any urls. Just give me the content from Dear XYZ to salutation."
            },
            {
                "role": "user",
                "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description}\n\nCover Letter:"
            }
        ]
        
        response = openai_client.chat.completions.create(
            model=ai_model,
            messages=messages,
            max_tokens=3000,
            temperature=0.7
        )
        cover_letter = response.choices[0].message.content.strip()
        return cover_letter
    except openai.UnprocessableEntityError as e:
        # Handle invalid requests, like a malformed request or invalid input format
        print(f"Invalid request error: {str(e)}")
        raise HTTPException(status_code=500, detail="The request to OpenAI was invalid. Please check the input format and content.")
    
    except openai.APIConnectionError as e:
        # Handle connection errors (e.g., network issues, timeout)
        print(f"API connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="There was an issue connecting to the OpenAI API. Please try again later.")
    
    except openai.RateLimitError as e:
        # Handle rate-limiting issues (too many requests)
        print(f"Rate limit exceeded: {str(e)}")
        raise HTTPException(status_code=400, detail="Rate limit exceeded. Please wait and try again after some time.")

    except openai.AuthenticationError as e:
        # Generic catch-all for any other OpenAI errors
        print(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=401, detail="OpenAI key is not valid")
    
    except Exception as e:
        # Catch-all for any unexpected errors
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected Error occured")
       
       
def update_markdown_with_openai(api_key, resume_markdown, job_description,ai_model):
    try:
        # Initialize the OpenAI client
        openai_client = OpenAI(api_key=api_key)

        # Define the system and user message for the API
        messages = [
            {"role": "system", "content": "You are an expert resume writer. Update the following resume to better fit the given job description. Maintain the structure and content of the original resume as much as possible. Don't reduce the size of content much. Don't fake any experience or skills that the original resume doesn't have. If anything seems obvious, then only add it; don't add any new data that would make it look fake. As the resume is of a less experienced professional, change the title according to the job description. If it's a senior role, mention it as a normal role, not a senior title. Add soft skills based on the job description. Making it ATS friendly according to the job description is our goal. Just give me resume content; don't add any info text from your side."},
            {"role": "user", "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description}\n\nUpdated Resume:"}
        ]

        # Make the API call to OpenAI
        response = openai_client.chat.completions.create(
            model=ai_model,
            messages=messages,
            max_tokens=3000,
            temperature=0.7
        )

        # Extract and return the updated resume content
        updated_markdown = response.choices[0].message.content.strip()
        return updated_markdown

    except openai.UnprocessableEntityError as e:
        # Handle invalid requests, like a malformed request or invalid input format
        print(f"Invalid request error: {str(e)}")
        raise HTTPException(status_code=500, detail="The request to OpenAI was invalid. Please check the input format and content.")
    
    except openai.APIConnectionError as e:
        # Handle connection errors (e.g., network issues, timeout)
        print(f"API connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="There was an issue connecting to the OpenAI API. Please try again later.")
    
    except openai.RateLimitError as e:
        # Handle rate-limiting issues (too many requests)
        print(f"Rate limit exceeded: {str(e)}")
        raise HTTPException(status_code=400, detail="Rate limit exceeded. Please wait and try again after some time.")

    except openai.AuthenticationError as e:
        # Generic catch-all for any other OpenAI errors
        print(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=401, detail="OpenAI key is not valid")
    
    except Exception as e:
        # Catch-all for any unexpected errors
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected Error occured")


def update_markdown_from_prompt(api_key, resume_markdown, job_description,user_prompt,ai_model):
    try:
        # Initialize the OpenAI client
        openai_client = OpenAI(api_key=api_key)

        improvement_prompt = user_prompt
        # Define the system and user message for the API
        messages = [
            {"role": "system", "content": "You are an expert resume writer. Update the following resume based on the Improvement prompt instructions given to better fit the given job description. Maintain the structure and content of the original resume as much as possible. Don't reduce the size of content much. Don't fake any experience or skills that the original resume doesn't have. Making it ATS friendly according to the job description is our goal. Just give me resume content; don't add any info text from your side."},
            {"role": "user", "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description} \n\nImprovement Prompt instructions: {improvement_prompt} \n\nUpdated Resume:"}
        ]

        # Make the API call to OpenAI
        response = openai_client.chat.completions.create(
            model=ai_model,
            messages=messages,
            max_tokens=3000,
            temperature=0.7
        )

        # Extract and return the updated resume content
        updated_markdown = response.choices[0].message.content.strip()
        return updated_markdown

    except openai.UnprocessableEntityError as e:
        # Handle invalid requests, like a malformed request or invalid input format
        print(f"Invalid request error: {str(e)}")
        raise HTTPException(status_code=500, detail="The request to OpenAI was invalid. Please check the input format and content.")
    
    except openai.APIConnectionError as e:
        # Handle connection errors (e.g., network issues, timeout)
        print(f"API connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="There was an issue connecting to the OpenAI API. Please try again later.")
    
    except openai.RateLimitError as e:
        # Handle rate-limiting issues (too many requests)
        print(f"Rate limit exceeded: {str(e)}")
        raise HTTPException(status_code=400, detail="Rate limit exceeded. Please wait and try again after some time.")

    except openai.AuthenticationError as e:
        # Generic catch-all for any other OpenAI errors
        print(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=401, detail="OpenAI key is not valid")
    
    except Exception as e:
        # Catch-all for any unexpected errors
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected Error occured")
   