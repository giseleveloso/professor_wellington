package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum TipoConteudo {
    LEITURA(1, "Leitura"),
    VIDEO(2, "Vídeo"),
    AUDIO(3, "Áudio"),
    LINK(4, "Link"),
    PDF(5, "PDF");

    private final Integer id;
    private final String label;

    TipoConteudo(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static TipoConteudo valueOf(Integer id) {
        if (id == null)
            return null;
        for (TipoConteudo tipo : TipoConteudo.values()) {
            if (tipo.getId().equals(id))
                return tipo;
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
