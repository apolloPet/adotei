package com.apollopet.adotei.backend.domain.entity;

public enum UserType {
    ADOTANTE("Pessoa que demonstra interesse em adotar um animal."),
    VOLUNTARIO("Perfil criado por administrador para cadastrar e gerenciar animais."),
    ADMIN("Administrador da plataforma com acesso completo.");

    private final String description;

    UserType(String description) {
        this.description = description;
    }

    public String description() {
        return description;
    }
}
