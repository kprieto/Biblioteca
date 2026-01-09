package com.unir.biblioteca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Objects;

@Setter
@Entity
public class Critica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String usuario;
    private String comentario;
    private Integer calificacion;
    private LocalDate fecha = LocalDate.now();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_libro")
    @JsonIgnoreProperties("criticas")
    private Libro libro;

    public Critica() {

    }

    public Critica(Long id, String usuario, String comentario, Integer calificacion, Libro libro, LocalDate fecha) {
        this.id = id;
        this.usuario = usuario;
        this.comentario = comentario;
        this.calificacion = calificacion;
        this.libro = libro;
        this.fecha = fecha;
    }

    public Long getId() {return id;}

    public String getUsuario() {return usuario;}

    public String getComentario() {return comentario;}

    public Integer getCalificacion() {return calificacion;}

    public Libro getLibro() {return libro;}

    public LocalDate getFecha() { return fecha; }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Critica critica = (Critica) o;
        return Objects.equals(id, critica.id) && Objects.equals(usuario, critica.usuario) && Objects.equals(comentario, critica.comentario) && Objects.equals(calificacion, critica.calificacion) && Objects.equals(libro, critica.libro) && Objects.equals(fecha, critica.fecha);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, usuario, comentario, calificacion, libro, fecha);
    }

    @Override
    public String toString() {
        return "Critica{" +
                "id=" + id +
                ", usuario='" + usuario + '\'' +
                ", comentario='" + comentario + '\'' +
                ", calificacion=" + calificacion +
                ", libro=" + libro +
                ", fecha=" + fecha +
                '}';
    }
}
