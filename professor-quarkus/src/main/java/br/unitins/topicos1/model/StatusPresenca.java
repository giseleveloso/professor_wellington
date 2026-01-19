package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum StatusPresenca {
    PRESENTE(1, "presente"),
    FALTA(2, "falta"),
    CANCELADA(3, "cancelada");

    private final Integer id;
    private final String label;

    StatusPresenca(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static StatusPresenca valueOf(Integer id) {
        if (id == null)
            return PRESENTE;
        for (StatusPresenca status : StatusPresenca.values()) {
            if (status.getId().equals(id))
                return status;
        }
        return PRESENTE;
    }

    public static StatusPresenca fromLabel(String label) {
        if (label == null)
            return PRESENTE;
        for (StatusPresenca status : StatusPresenca.values()) {
            if (status.getLabel().equalsIgnoreCase(label))
                return status;
        }
        return PRESENTE;
    }
}
