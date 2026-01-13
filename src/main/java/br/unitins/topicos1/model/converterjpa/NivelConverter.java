package br.unitins.topicos1.model.converterjpa;

import br.unitins.topicos1.model.Nivel;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class NivelConverter implements AttributeConverter<Nivel, Integer> {

    @Override
    public Integer convertToDatabaseColumn(Nivel nivel) {
        return nivel == null ? null : nivel.getId();
    }

    @Override
    public Nivel convertToEntityAttribute(Integer id) {
        return Nivel.valueOf(id);
    }
}
