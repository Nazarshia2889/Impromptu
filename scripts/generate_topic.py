import os
import dotenv

dotenv.load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

import typing_extensions as tx
import google.generativeai as genai

genai.configure(api_key=api_key)

# with open('scripts/prompts/generate_topic.txt') as f:
	# prompt = f.read()

prompt = '''i am trying to practice impromptu speaking. generate one speaking topics that are topics that are well known and debatable and have two sides to the argument and no correct answer. here is an example of questions that you should generate. in your actual response, only output a single question:

[
  {
    "question": "Should social media platforms be regulated by the government?",
    "viewpoint1": "Regulation protects against misinformation and harmful content.",
    "viewpoint2": "It could limit free speech and innovation."
  },
  {
    "question": "Is it ethical to use animals for testing medical products?",
    "viewpoint1": "Animal testing is necessary for scientific progress and safety.",
    "viewpoint2": "It is inhumane and outdated."
  },
  {
    "question": "Does technology make us more alone or more connected?",
    "viewpoint1": "Technology connects people globally.",
    "viewpoint2": "It replaces deep, meaningful in-person relationships."
  },
  {
    "question": "Should college education be free for everyone?",
    "viewpoint1": "Free college increases opportunities for all.",
    "viewpoint2": "It may reduce educational quality and be financially unsustainable."
  },
  {
    "question": "Is the death penalty an effective deterrent to crime?",
    "viewpoint1": "The death penalty deters severe crime.",
    "viewpoint2": "There is no evidence of deterrence and it risks wrongful executions."
  },
  {
    "question": "Is it better to prioritize privacy or security in today’s digital age?",
    "viewpoint1": "Security is crucial for public safety.",
    "viewpoint2": "Excessive surveillance threatens privacy and freedom."
  },
  {
    "question": "Do video games contribute to youth violence?",
    "viewpoint1": "Violent video games desensitize young people.",
    "viewpoint2": "There is no conclusive link to real-world violence."
  },
  {
    "question": "Is artificial intelligence more of a benefit or a threat to society?",
    "viewpoint1": "AI makes tasks more efficient and drives innovation.",
    "viewpoint2": "AI could lead to job displacement and poses ethical risks."
  },
  {
    "question": "Should we implement a universal basic income?",
    "viewpoint1": "UBI reduces poverty and supports people during unemployment.",
    "viewpoint2": "It is too expensive and could disincentivize work."
  },
  {
    "question": "Is climate change a responsibility of individuals or corporations?",
    "viewpoint1": "Individuals should reduce their carbon footprint.",
    "viewpoint2": "Corporations have the biggest impact and should lead the way."
  },
  {
    "question": "Should there be limits on freedom of speech?",
    "viewpoint1": "Limits prevent hate speech and violence.",
    "viewpoint2": "Any restriction on speech threatens democracy."
  },
  {
    "question": "Does the school system kill creativity?",
    "viewpoint1": "The emphasis on testing stifles creativity.",
    "viewpoint2": "Structure and foundational knowledge are necessary for growth."
  },
  {
    "question": "Should wealthy countries be required to share vaccines or resources during global crises?",
    "viewpoint1": "Wealthy countries have a moral responsibility to share.",
    "viewpoint2": "Countries should prioritize their own citizens first."
  },
  {
    "question": "Are standardized tests an effective measure of student ability?",
    "viewpoint1": "Standardized tests provide an objective metric.",
    "viewpoint2": "They fail to capture a student’s true abilities and potential."
  },
  {
    "question": "Is cancel culture a necessary form of accountability or a dangerous trend?",
    "viewpoint1": "Cancel culture holds people accountable for harmful actions.",
    "viewpoint2": "It acts as mob justice with no room for redemption."
  },
  {
    "question": "Should we give priority to economic growth over environmental protection?",
    "viewpoint1": "Economic growth improves quality of life.",
    "viewpoint2": "Neglecting the environment causes long-term damage."
  },
  {
    "question": "Is the use of surveillance cameras an invasion of privacy or a necessity for safety?",
    "viewpoint1": "Surveillance cameras increase public safety.",
    "viewpoint2": "They infringe on privacy rights."
  },
  {
    "question": "Should genetically modified foods be banned?",
    "viewpoint1": "GM foods increase food production and improve nutrition.",
    "viewpoint2": "There are fears of health risks and environmental impacts."
  },
  {
    "question": "Is remote work better for productivity than in-office work?",
    "viewpoint1": "Remote work offers flexibility and comfort.",
    "viewpoint2": "In-office work fosters better collaboration and focus."
  },
  {
    "question": "Should social media influencers be held to stricter ethical guidelines?",
    "viewpoint1": "Stricter guidelines protect consumers from misinformation.",
    "viewpoint2": "It would limit creativity and freedom of expression."
  }
]
'''

model = genai.GenerativeModel("gemini-1.5-flash")
result = model.generate_content(
	prompt,
	generation_config=genai.GenerationConfig(
		response_mime_type='application/json'
	),
)

print(result.text.replace('\n', ''))
