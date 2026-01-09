package com.unir.biblioteca.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;

@Entity
public class Aquilar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    //private Long libroId;
    private String usuarioNombre;
    private LocalDate fechaInicio;
    @Column(name = "fecha_fin")
    @JsonProperty("fechaFin")
    private LocalDate fechaFin;

    @OneToOne
    @JoinColumn(name = "libro_id")
    @JsonIgnore // Para evitar que el JSON entre en un bucle infinito
    private Libro libro;

    public Aquilar() {

    }

    public Aquilar(Long id, Libro libro, String usuarioNombre, LocalDate fechaInicio, LocalDate fechaFin) {
        this.id = id;
        this.libro= libro;
        this.usuarioNombre = usuarioNombre;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    //public Long getLibroId() { return libroId; }
    //public void setLibroId(Long libroId) { this.libroId = libroId; }
    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) {this.fechaInicio = fechaInicio;}
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) {this.fechaFin = fechaFin; }
    public Libro getLibro() {return libro;}
    public void setLibro(Libro libro) {
        this.libro = libro;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Aquilar renta = (Aquilar) o;
        return Objects.equals(id, renta.id) /*&& Objects.equals(libroId, renta.libroId)*/ && Objects.equals(usuarioNombre, renta.usuarioNombre) && Objects.equals(fechaInicio, renta.fechaInicio) && Objects.equals(fechaFin, renta.fechaFin);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, /*libroId,*/ usuarioNombre, fechaInicio, fechaFin);
    }

    @Override
    public String toString() {
        return "Aquilar{" +
                "id=" + id +
                /*", libroId=" + libroId +*/
                ", usuarioNombre='" + usuarioNombre + '\'' +
                ", fechaInicio=" + fechaInicio +
                ", fechaFin=" + fechaFin +
                ", libro=" + libro +
                '}';
    }
}

