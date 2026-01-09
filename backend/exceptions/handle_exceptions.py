from fastapi import HTTPException, status

exception_access_dained = HTTPException(
    status.HTTP_401_UNAUTHORIZED, "Acesso não autorizado para usuários comuns"
)
exception_access_dained_for_user = HTTPException(
    status.HTTP_403_FORBIDDEN, "Acesso negado para seu usuário"
)
exception_user_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
)
