package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Idioma {
    INGLES(1, "Inglês"),
    ESPANHOL(2, "Espanhol"),
    FRANCES(3, "Francês"),
    ALEMAO(4, "Alemão"),
    ITALIANO(5, "Italiano"),
    JAPONES(6, "Japonês"),
    CHINES(7, "Chinês"),
    COREANO(8, "Coreano"),
    PORTUGUES(9, "Português"),
    OUTRO(10, "Outro");

    private final Integer id;
    private final String label;

    Idioma(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static Idioma valueOf(Integer id) {
        if (id == null)
            return null;
        for (Idioma idioma : Idioma.values()) {
            if (idioma.getId().equals(id))
                return idioma;
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
