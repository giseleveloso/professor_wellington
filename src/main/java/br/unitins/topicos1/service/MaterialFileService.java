package br.unitins.topicos1.service;

import java.io.File;
import java.io.IOException;

public interface MaterialFileService {

    void salvar(Long id, String nomeArquivo, byte[] arquivo) throws IOException;
    File download(String nomeArquivo);
}
