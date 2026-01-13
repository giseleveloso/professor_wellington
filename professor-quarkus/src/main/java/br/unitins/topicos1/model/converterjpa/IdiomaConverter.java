package br.unitins.topicos1.model.converterjpa;

import br.unitins.topicos1.model.Idioma;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class IdiomaConverter implements AttributeConverter<Idioma, Integer> {

    @Override
    public Integer convertToDatabaseColumn(Idioma idioma) {
        return idioma == null ? null : idioma.getId();
    }

    @Override
    public Idioma convertToEntityAttribute(Integer id) {
        return Idioma.valueOf(id);
    }
}
