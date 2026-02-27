package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum StatusPreparacaoAula {
    FEITO(1, "feito"),
    NAO_FEITO(2, "nao_feito"),
    NAO_APLICA(3, "nao_aplica");

    private final Integer id;
    private final String label;

    StatusPreparacaoAula(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static StatusPreparacaoAula valueOf(Integer id) {
        if (id == null)
            return NAO_APLICA;
        for (StatusPreparacaoAula status : StatusPreparacaoAula.values()) {
            if (status.getId().equals(id))
                return status;
        }
        return NAO_APLICA;
    }

    public static StatusPreparacaoAula fromLabel(String label) {
        if (label == null)
            return NAO_APLICA;
        for (StatusPreparacaoAula status : StatusPreparacaoAula.values()) {
            if (status.getLabel().equalsIgnoreCase(label))
                return status;
        }
        return NAO_APLICA;
    }
}
