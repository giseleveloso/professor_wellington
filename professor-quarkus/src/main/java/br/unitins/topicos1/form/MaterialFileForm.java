package br.unitins.topicos1.form;

import org.jboss.resteasy.annotations.providers.multipart.PartType;

import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;

public class MaterialFileForm {

    @FormParam("nomeArquivo")
    @PartType(MediaType.TEXT_PLAIN)
    private String nomeArquivo;

    @FormParam("arquivo")
    @PartType(MediaType.APPLICATION_OCTET_STREAM)
    private byte[] arquivo;

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public byte[] getArquivo() {
        return arquivo;
    }

    public void setArquivo(byte[] arquivo) {
        this.arquivo = arquivo;
    }
}
