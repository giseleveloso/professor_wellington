package br.unitins.topicos1.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.unitins.topicos1.model.Desempenho;

public record DesempenhoResponseDTO(
    Long id,
    BigDecimal nota,
    String comentario,
    Boolean privado,
    Long idAula,
    LocalDate dataAula,
    String topicoAula,
    Long idAluno,
    String nomeAluno
) {
    public static DesempenhoResponseDTO valueOf(Desempenho desempenho) {
        return new DesempenhoResponseDTO(
            desempenho.getId(),
            desempenho.getNota(),
            desempenho.getComentario(),
            desempenho.getPrivado(),
            desempenho.getAula() != null ? desempenho.getAula().getId() : null,
            desempenho.getAula() != null ? desempenho.getAula().getData() : null,
            desempenho.getAula() != null ? desempenho.getAula().getTopico() : null,
            desempenho.getAluno() != null ? desempenho.getAluno().getId() : null,
            desempenho.getAluno() != null ? desempenho.getAluno().getNome() : null
        );
    }
    
    // Para alunos - oculta comentários privados
    public static DesempenhoResponseDTO valueOfParaAluno(Desempenho desempenho) {
        String comentarioVisivel = (desempenho.getPrivado() != null && desempenho.getPrivado()) 
            ? null 
            : desempenho.getComentario();
            
        return new DesempenhoResponseDTO(
            desempenho.getId(),
            desempenho.getNota(),
            comentarioVisivel,
            null, // Não mostra flag privado para aluno
            desempenho.getAula() != null ? desempenho.getAula().getId() : null,
            desempenho.getAula() != null ? desempenho.getAula().getData() : null,
            desempenho.getAula() != null ? desempenho.getAula().getTopico() : null,
            desempenho.getAluno() != null ? desempenho.getAluno().getId() : null,
            desempenho.getAluno() != null ? desempenho.getAluno().getNome() : null
        );
    }
}
