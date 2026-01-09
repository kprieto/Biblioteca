package com.unir.biblioteca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Setter;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Setter
@Entity
public class Libro {

    @Id
    @org.springframework.data.annotation.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Field(type = FieldType.Text, analyzer = "spanish")
    private String titulo;
    @Field(type = FieldType.Text)
    private String autor;
    private Integer anioPublicacion;
    private String isbn10;
    private String isbn13;
    private String imagenPortada;
    @Column(length = 2000)
    @Field(type = FieldType.Text)
    private String sinopsis;
    private Boolean disponible = true;


    @OneToOne(mappedBy = "libro", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Aquilar alquilerActivo;


    @JsonProperty("fechaFin")
    public LocalDate getFechaFin() {
        return (alquilerActivo != null) ? alquilerActivo.getFechaFin() : null;
    }

    @OneToMany(mappedBy = "libro", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("libro")
    private List<Critica> criticas = new ArrayList<>();

    // Getters y Setters
    public Libro () {

    }

    public Libro(String titulo, String autor, Integer anioPublicacion, String isbn10,
                 String isbn13, String imagenPortada, String sinopsis, Boolean disponible) {
        this.titulo = titulo;
        this.autor = autor;
        this.anioPublicacion = anioPublicacion;
        this.isbn10 = isbn10;
        this.isbn13 = isbn13;
        this.imagenPortada = imagenPortada;
        this.sinopsis = sinopsis;
        this.disponible = disponible;
    }

    public Long getId() { return id; }

    public String getTitulo() { return titulo; }

    public String getAutor() { return autor; }

    public Integer getAnioPublicacion() { return anioPublicacion; }

    public String getIsbn10() { return isbn10; }

    public String getIsbn13() { return isbn13; }

    public String getImagenPortada() { return imagenPortada; }

    public String getSinopsis() { return sinopsis; }

    public Boolean isDisponible() { return disponible; }

    public Aquilar getAlquilerActivo() { return alquilerActivo; }

    public List<Critica> getCriticas() { return criticas; }
    public void setCriticas(List<Critica> criticas) { this.criticas = criticas; }



    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Libro libro = (Libro) o;
        return Objects.equals(id, libro.id) && Objects.equals(titulo, libro.titulo)
                && Objects.equals(autor, libro.autor) && Objects.equals(anioPublicacion, libro.anioPublicacion)
                && Objects.equals(isbn10, libro.isbn10) && Objects.equals(isbn13, libro.isbn13)
                && Objects.equals(imagenPortada, libro.imagenPortada) && Objects.equals(sinopsis, libro.sinopsis)
                && Objects.equals(disponible, libro.disponible) && Objects.equals(criticas, libro.criticas);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, titulo, autor, anioPublicacion, isbn10, isbn13, imagenPortada, sinopsis, disponible, criticas);
    }

    @Override
    public String toString() {
        return "Libro{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", autor='" + autor + '\'' +
                ", anioPublicacion=" + anioPublicacion +
                ", isbn10='" + isbn10 + '\'' +
                ", isbn13='" + isbn13 + '\'' +
                ", imagenPortada='" + imagenPortada + '\'' +
                ", sinopsis='" + sinopsis + '\'' +
                ", disponible=" + disponible +
                ", criticas=" + criticas +
                ", aquilar=" + alquilerActivo +
                '}';
    }
}
