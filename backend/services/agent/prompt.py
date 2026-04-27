prompt = {
    "messages": [
        {
            "role": "user",  # papeis podem ser system, user ou assistant, nesse caso o user é quem faz a pergunta
            "content": """
Baseado na seguinte base de dados, responda a pergunta do usuário:
{context}
Pergunta: {question}
""",
        }
    ]
}
