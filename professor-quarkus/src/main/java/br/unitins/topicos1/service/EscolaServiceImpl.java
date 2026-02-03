package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.EscolaDTO;
import br.unitins.topicos1.dto.EscolaResponseDTO;
import br.unitins.topicos1.model.Escola;
import br.unitins.topicos1.model.ModoTenant;
import br.unitins.topicos1.repository.EscolaRepository;
import br.unitins.topicos1.repository.ProfessorRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class EscolaServiceImpl implements EscolaService {

    @Inject
    EscolaRepository escolaRepository;

    @Inject
    ProfessorRepository professorRepository;

    @Override
    @Transactional
    public EscolaResponseDTO create(EscolaDTO dto) {
        var existente = escolaRepository.findByNome(dto.nome());
        if (existente != null) {
            throw new ValidationException("nome", "Já existe uma escola com este nome");
        }

        Escola escola = new Escola();
        escola.setNome(dto.nome());
        escola.setDescricao(dto.descricao());
        escola.setAtivo(true);

        escolaRepository.persist(escola);
        return EscolaResponseDTO.valueOf(escola);
    }

    @Override
    @Transactional
    public EscolaResponseDTO update(Long id, EscolaDTO dto) {
        Escola escola = escolaRepository.findById(id);
        if (escola == null) {
            throw new ValidationException("id", "Escola não encontrada");
        }

        var existente = escolaRepository.findByNome(dto.nome());
        if (existente != null && !existente.getId().equals(id)) {
            throw new ValidationException("nome", "Já existe uma escola com este nome");
        }

        escola.setNome(dto.nome());
        escola.setDescricao(dto.descricao());

        return EscolaResponseDTO.valueOf(escola);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Escola escola = escolaRepository.findById(id);
        if (escola != null) {
            // Remove a associação dos professores com esta escola
            var professores = professorRepository.find("escola.id", id).list();
            for (var professor : professores) {
                professor.setEscola(null);
                professor.setModoTenant(ModoTenant.INDIVIDUAL);
            }
            escolaRepository.delete(escola);
        }
    }

    @Override
    public EscolaResponseDTO findById(Long id) {
        Escola escola = escolaRepository.findById(id);
        if (escola == null) {
            throw new ValidationException("id", "Escola não encontrada");
        }
        return EscolaResponseDTO.valueOf(escola);
    }

    @Override
    public List<EscolaResponseDTO> findAll() {
        return escolaRepository.listAll()
            .stream()
            .map(EscolaResponseDTO::valueOf)
            .collect(Collectors.toList());
    }

    @Override
    public List<EscolaResponseDTO> findAllAtivas() {
        return escolaRepository.findAllAtivas()
            .stream()
            .map(EscolaResponseDTO::valueOf)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void ativarDesativar(Long id, boolean ativo) {
        Escola escola = escolaRepository.findById(id);
        if (escola == null) {
            throw new ValidationException("id", "Escola não encontrada");
        }
        escola.setAtivo(ativo);
    }

    @Override
    @Transactional
    public void adicionarProfessor(Long escolaId, Long professorId) {
        Escola escola = escolaRepository.findById(escolaId);
        if (escola == null) {
            throw new ValidationException("escolaId", "Escola não encontrada");
        }

        var professor = professorRepository.findById(professorId);
        if (professor == null) {
            throw new ValidationException("professorId", "Professor não encontrado");
        }

        professor.setEscola(escola);
        professor.setModoTenant(ModoTenant.ESCOLA);
    }

    @Override
    @Transactional
    public void removerProfessor(Long professorId) {
        var professor = professorRepository.findById(professorId);
        if (professor == null) {
            throw new ValidationException("professorId", "Professor não encontrado");
        }

        professor.setEscola(null);
        professor.setModoTenant(ModoTenant.INDIVIDUAL);
    }
}
