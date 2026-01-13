package br.unitins.topicos1.model.converterjpa;

import br.unitins.topicos1.model.TipoConteudo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoConteudoConverter implements AttributeConverter<TipoConteudo, Integer> {

    @Override
    public Integer convertToDatabaseColumn(TipoConteudo tipo) {
        return tipo == null ? null : tipo.getId();
    }

    @Override
    public TipoConteudo convertToEntityAttribute(Integer id) {
        return TipoConteudo.valueOf(id);
    }
}
