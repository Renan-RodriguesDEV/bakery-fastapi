"""
Script de teste para WebSocket.
Executa testes básicos de conexão e mensagens WebSocket.
"""
import asyncio
import json

try:
    import websockets
except ImportError:
    print("⚠️  websockets não instalado. Instalando...")
    import subprocess
    subprocess.check_call(["pip", "install", "websockets"])
    import websockets


async def test_notifications_endpoint():
    """Testa o endpoint de notificações WebSocket"""
    print("\n🧪 Testando endpoint /ws/notifications/{user_id}...")
    
    user_id = 1
    uri = f"ws://localhost:8000/ws/notifications/{user_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            # Recebe mensagem de boas-vindas
            welcome_message = await websocket.recv()
            print(f"✅ Conectado! Mensagem recebida: {welcome_message}")
            
            welcome_data = json.loads(welcome_message)
            assert welcome_data["type"] == "connection", "Tipo de mensagem incorreto"
            assert welcome_data["user_id"] == user_id, "User ID incorreto"
            
            # Envia um ping
            await websocket.send(json.dumps({"type": "ping"}))
            print("📤 Ping enviado")
            
            # Recebe pong
            pong_message = await websocket.recv()
            print(f"📥 Pong recebido: {pong_message}")
            
            pong_data = json.loads(pong_message)
            assert pong_data["type"] == "pong", "Resposta de ping incorreta"
            
            # Envia uma mensagem
            await websocket.send(json.dumps({"message": "Teste de mensagem"}))
            print("📤 Mensagem de teste enviada")
            
            # Recebe echo
            echo_message = await websocket.recv()
            print(f"📥 Echo recebido: {echo_message}")
            
            echo_data = json.loads(echo_message)
            assert echo_data["type"] == "echo", "Tipo de echo incorreto"
            
            print("✅ Teste de notificações passou!")
            
    except Exception as e:
        print(f"❌ Erro no teste de notificações: {e}")
        raise


async def test_chat_endpoint():
    """Testa o endpoint de chat WebSocket"""
    print("\n🧪 Testando endpoint /ws/chat/{user_id}...")
    
    user_id = 2
    uri = f"ws://localhost:8000/ws/chat/{user_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            # Recebe mensagem de entrada no chat
            join_message = await websocket.recv()
            print(f"✅ Conectado ao chat! Mensagem recebida: {join_message}")
            
            join_data = json.loads(join_message)
            assert join_data["type"] == "user_joined", "Tipo de mensagem incorreto"
            assert join_data["user_id"] == user_id, "User ID incorreto"
            
            # Envia uma mensagem no chat
            await websocket.send(json.dumps({
                "type": "message",
                "content": "Olá, pessoal!"
            }))
            print("📤 Mensagem de chat enviada")
            
            # Recebe broadcast da própria mensagem
            broadcast_message = await websocket.recv()
            print(f"📥 Broadcast recebido: {broadcast_message}")
            
            broadcast_data = json.loads(broadcast_message)
            assert broadcast_data["type"] == "message", "Tipo de mensagem incorreto"
            assert broadcast_data["user_id"] == user_id, "User ID incorreto"
            assert broadcast_data["content"] == "Olá, pessoal!", "Conteúdo incorreto"
            
            print("✅ Teste de chat passou!")
            
    except Exception as e:
        print(f"❌ Erro no teste de chat: {e}")
        raise


async def test_multiple_connections():
    """Testa múltiplas conexões simultâneas"""
    print("\n🧪 Testando múltiplas conexões simultâneas...")
    
    user1_id = 1
    user2_id = 2
    
    uri1 = f"ws://localhost:8000/ws/notifications/{user1_id}"
    uri2 = f"ws://localhost:8000/ws/notifications/{user2_id}"
    
    try:
        async with websockets.connect(uri1) as ws1, websockets.connect(uri2) as ws2:
            # Recebe mensagens de boas-vindas
            welcome1 = await ws1.recv()
            welcome2 = await ws2.recv()
            
            print(f"✅ Usuário 1 conectado: {json.loads(welcome1)['message']}")
            print(f"✅ Usuário 2 conectado: {json.loads(welcome2)['message']}")
            
            # Envia ping de ambos
            await ws1.send(json.dumps({"type": "ping"}))
            await ws2.send(json.dumps({"type": "ping"}))
            
            # Recebe pongs
            pong1 = await ws1.recv()
            pong2 = await ws2.recv()
            
            assert json.loads(pong1)["type"] == "pong"
            assert json.loads(pong2)["type"] == "pong"
            
            print("✅ Teste de múltiplas conexões passou!")
            
    except Exception as e:
        print(f"❌ Erro no teste de múltiplas conexões: {e}")
        raise


async def main():
    """Função principal que executa todos os testes"""
    print("=" * 60)
    print("🚀 Iniciando testes de WebSocket")
    print("=" * 60)
    print("\n⚠️  Certifique-se de que o servidor está rodando em http://localhost:8000")
    print("   Execute: uvicorn app:app --reload")
    
    await asyncio.sleep(2)  # Aguarda um pouco antes de começar
    
    try:
        await test_notifications_endpoint()
        await asyncio.sleep(1)
        
        await test_chat_endpoint()
        await asyncio.sleep(1)
        
        await test_multiple_connections()
        
        print("\n" + "=" * 60)
        print("✅ Todos os testes passaram com sucesso!")
        print("=" * 60)
        
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Testes falhou: {e}")
        print("=" * 60)
        raise


if __name__ == "__main__":
    asyncio.run(main())
