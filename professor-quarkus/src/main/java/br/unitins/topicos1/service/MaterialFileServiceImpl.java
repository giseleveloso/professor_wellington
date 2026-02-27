package br.unitins.topicos1.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import br.unitins.topicos1.model.MaterialExtraAula;
import br.unitins.topicos1.repository.MaterialExtraAulaRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MaterialFileServiceImpl implements MaterialFileService {

    private final String PATH_USER = System.getProperty("user.home")
        + File.separator + "quarkus"
        + File.separator + "files"
        + File.separator + "materiais" + File.separator;

    @Inject
    MaterialExtraAulaRepository materialRepository;

    @Override
    @Transactional
    public void salvar(Long id, String nomeArquivo, byte[] arquivo) throws IOException {
        MaterialExtraAula material = materialRepository.findById(id);
        if (material == null) {
            throw new ValidationException("id", "Material não encontrado");
        }

        String nomeArquivoSalvo = salvarArquivo(nomeArquivo, arquivo);
        material.setNomeArquivo(nomeArquivoSalvo);
    }

    private String salvarArquivo(String nomeArquivo, byte[] arquivo) throws IOException {
        // verificar o tipo do arquivo
        String mimeType = Files.probeContentType(new File(nomeArquivo).toPath());
        List<String> listMimeType = Arrays.asList(
            "application/pdf",
            "image/jpg", "image/jpeg", "image/png", "image/gif",
            "audio/mpeg", "audio/mp3", "audio/wav",
            "video/mp4", "video/webm",
            "text/plain", "text/html",
            "application/epub+zip",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        
        if (mimeType != null && !listMimeType.contains(mimeType)) {
            throw new IOException("Tipo de arquivo não suportado: " + mimeType);
        }

        // verificar o tamanho do arquivo - não permitir maior que 50mb
        if (arquivo.length > 1024 * 1024 * 50) {
            throw new IOException("Arquivo muito grande, tamanho máximo 50mb.");
        }

        // criar pasta quando não existir
        File diretorio = new File(PATH_USER);
        if (!diretorio.exists()) {
            diretorio.mkdirs();
        }

        // gerar nome do arquivo
        String extensao = "";
        if (nomeArquivo.contains(".")) {
            extensao = nomeArquivo.substring(nomeArquivo.lastIndexOf("."));
        }
        String nomeArquivoSalvo = UUID.randomUUID() + extensao;
        String path = PATH_USER + nomeArquivoSalvo;

        // salvar o arquivo
        File file = new File(path);
        if (file.exists()) {
            throw new IOException("Este arquivo já existe.");
        }

        // criar o arquivo no SO
        file.createNewFile();

        FileOutputStream fos = new FileOutputStream(file);
        fos.write(arquivo);
        fos.flush();
        fos.close();

        return nomeArquivoSalvo;
    }

    @Override
    public File download(String nomeArquivo) {
        return new File(PATH_USER + nomeArquivo);
    }
}
