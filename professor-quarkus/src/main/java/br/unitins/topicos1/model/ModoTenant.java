package br.unitins.topicos1.model;

public enum ModoTenant {
    INDIVIDUAL(1, "Individual"),
    ESCOLA(2, "Compartilhado (Escola)");

    private final Integer id;
    private final String label;

    ModoTenant(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static ModoTenant valueOf(Integer id) {
        if (id == null) return INDIVIDUAL;
        for (ModoTenant modo : values()) {
            if (modo.getId().equals(id)) {
                return modo;
            }
        }
        return INDIVIDUAL;
    }
}
