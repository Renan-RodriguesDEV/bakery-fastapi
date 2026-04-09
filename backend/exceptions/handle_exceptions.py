from fastapi import HTTPException, status

exception_access_dained = HTTPException(
    status.HTTP_401_UNAUTHORIZED, "Acesso não autorizado para usuários comuns"
)
exception_access_dained_for_user = HTTPException(
    status.HTTP_403_FORBIDDEN, "Acesso negado para seu usuário"
)
exception_user_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, "Usuário não encontrado"
)
exception_product_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, "Produto não encontrado"
)
exception_category_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, "Categoria não encontrada"
)
exception_cart_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, "Carrinho não encontrado"
)
exception_sale_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, "Venda não encontrado"
)
exception_missing_content = HTTPException(
    status.HTTP_422_UNPROCESSABLE_ENTITY, "Faltou conteudo para sua requisição"
)
exception_invalid_token = HTTPException(
    status.HTTP_401_UNAUTHORIZED, "Seu token está invalido"
)
exception_image_not_found = HTTPException(
    status.HTTP_404_NOT_FOUND, "Imagem não encontrado"
)
exception_not_payment = HTTPException(
    status_code=status.HTTP_204_NO_CONTENT,
    detail="Não houve resposta no metodo de criação de pagamento",
)

exception_unauthorized_delete = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é permitido deletar a categoria padrão",
        )
def exception_runnable(e):
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
    )


def exception_payment_error(e):
    return Exception(f"Erro ao criar preferência de pagamento: {e}")
