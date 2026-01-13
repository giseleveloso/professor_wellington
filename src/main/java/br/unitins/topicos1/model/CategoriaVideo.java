package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum CategoriaVideo {
    GRAMATICA(1, "Gramática"),
    VOCABULARIO(2, "Vocabulário"),
    HISTORIAS(3, "Histórias"),
    CONVERSACAO(4, "Conversação"),
    PRONUNCIA(5, "Pronúncia"),
    CULTURA(6, "Cultura"),
    OUTRO(7, "Outro");

    private final Integer id;
    private final String label;

    CategoriaVideo(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static CategoriaVideo valueOf(Integer id) {
        if (id == null)
            return null;
        for (CategoriaVideo categoria : CategoriaVideo.values()) {
            if (categoria.getId().equals(id))
                return categoria;
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
