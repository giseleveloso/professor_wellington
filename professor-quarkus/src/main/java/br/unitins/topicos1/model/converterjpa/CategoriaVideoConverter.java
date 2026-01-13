package br.unitins.topicos1.model.converterjpa;

import br.unitins.topicos1.model.CategoriaVideo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CategoriaVideoConverter implements AttributeConverter<CategoriaVideo, Integer> {

    @Override
    public Integer convertToDatabaseColumn(CategoriaVideo categoria) {
        return categoria == null ? null : categoria.getId();
    }

    @Override
    public CategoriaVideo convertToEntityAttribute(Integer id) {
        return CategoriaVideo.valueOf(id);
    }
}
