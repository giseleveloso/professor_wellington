package br.unitins.topicos1.model.converterjpa;

import br.unitins.topicos1.model.StatusPagamento;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusPagamentoConverter implements AttributeConverter<StatusPagamento, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StatusPagamento status) {
        return status == null ? null : status.getId();
    }

    @Override
    public StatusPagamento convertToEntityAttribute(Integer id) {
        return StatusPagamento.valueOf(id);
    }
}
