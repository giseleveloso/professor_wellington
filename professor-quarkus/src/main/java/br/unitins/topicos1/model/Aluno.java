package br.unitins.topicos1.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Entity
public class Aluno extends DefaultEntity {

    private String nome;
    private String email;
    private LocalDate dataNascimento;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_telefone")
    private Telefone telefone;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_telefone_responsavel")
    private Telefone telefoneResponsavel;
    
    @OneToOne
    @JoinColumn(name = "id_usuario", unique = true)
    private Usuario usuario;
    
    // Mantém compatibilidade com turma única (legado)
    @ManyToOne
    @JoinColumn(name = "id_turma")
    private Turma turma;
    
    // Novo: múltiplas turmas
    @ManyToMany
    @JoinTable(
        name = "aluno_turmas",
        joinColumns = @JoinColumn(name = "id_aluno"),
        inverseJoinColumns = @JoinColumn(name = "id_turma")
    )
    private List<Turma> turmas;
    
    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    private List<Presenca> presencas;
    
    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    private List<Desempenho> desempenhos;
    
    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    private List<Pagamento> pagamentos;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Telefone getTelefone() {
        return telefone;
    }

    public void setTelefone(Telefone telefone) {
        this.telefone = telefone;
    }

    public Telefone getTelefoneResponsavel() {
        return telefoneResponsavel;
    }

    public void setTelefoneResponsavel(Telefone telefoneResponsavel) {
        this.telefoneResponsavel = telefoneResponsavel;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }

    public List<Turma> getTurmas() {
        return turmas;
    }

    public void setTurmas(List<Turma> turmas) {
        this.turmas = turmas;
    }

    public List<Presenca> getPresencas() {
        return presencas;
    }

    public void setPresencas(List<Presenca> presencas) {
        this.presencas = presencas;
    }

    public List<Desempenho> getDesempenhos() {
        return desempenhos;
    }

    public void setDesempenhos(List<Desempenho> desempenhos) {
        this.desempenhos = desempenhos;
    }

    public List<Pagamento> getPagamentos() {
        return pagamentos;
    }

    public void setPagamentos(List<Pagamento> pagamentos) {
        this.pagamentos = pagamentos;
    }
}
