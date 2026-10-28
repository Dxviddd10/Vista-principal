package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"api-gitlab/internal/models"
)

type EmailService struct {
	HttpClient *http.Client
}

// NewEmailService inicializa el servicio sin necesidad de credenciales SMTP
func NewEmailService() *EmailService {
	return &EmailService{
		HttpClient: &http.Client{Timeout: 5 * time.Second},
	}
}

// EnviarPeticionAPI es el método interno que ejecuta la petición HTTP (PUT) a la API centralizada
func (s *EmailService) EnviarPeticionAPI(payload models.EmailPayload) error {
	apiCorreosUrl := os.Getenv("API_CORREOS_URL")
	if apiCorreosUrl == "" {
		slog.Warn("API_CORREOS_URL no está definida en el entorno. No se enviará el correo.")
		return nil
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("error serializando payload de correo: %v", err)
	}

	req, err := http.NewRequest("PUT", apiCorreosUrl, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return fmt.Errorf("error creando request HTTP para correo: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Se ejecuta de manera asíncrona para no bloquear los handlers
	go func() {
		resp, err := s.HttpClient.Do(req)
		if err != nil {
			slog.Warn("Falló la petición a la API de correos", "error", err)
			return
		}
		defer resp.Body.Close()
		slog.Info("Notificación enviada a la API de correos exitosamente", "asunto", payload.Asunto)
	}()

	return nil
}

// 1. Notificación de Conflicto (NUEVO)
func (s *EmailService) EnviarNotificacionConflicto(ctx context.Context, destinatarios []string, branchName, targetBranch, projectID, repositorio string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	urlComparacionConflicto := buildConflictComparisonURL(os.Getenv("FRONTEND_BASE_URL"), projectID, branchName, targetBranch)

	payload := models.EmailPayload{
		Asunto:     "⚠️ Conflicto de código detectado en la rama: " + branchName,
		TipoCuerpo: "plantilla",
		Plantilla:  "conflicto-rama",
		Destino:    destinatarios,
		Datos: []models.DatoDinamico{
			{Clave: "rama_afectada", Valor: branchName},
			{Clave: "rama_destino", Valor: targetBranch},
			{Clave: "repositorio", Valor: repositorio},
			{Clave: "url_comparacion_conflicto", Valor: urlComparacionConflicto},
			{Clave: "desarrolladores_involucrados", Valor: strings.Join(destinatarios, ", ")},
			{Clave: "instrucciones", Valor: "La rama se ha marcado en conflicto en la base de datos. Por favor, coordinen la resolución del código para poder continuar."},
			{Clave: "fecha", Valor: time.Now().Format("2006-01-02 15:04:05")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

func buildConflictComparisonURL(frontendBaseURL, projectID, sourceBranch, targetBranch string) string {
	frontendBaseURL = strings.TrimRight(strings.TrimSpace(frontendBaseURL), "/")
	if frontendBaseURL == "" {
		slog.Warn("FRONTEND_BASE_URL no está definida. La notificación de conflicto no incluirá enlace de comparación.")
		return ""
	}

	comparisonURL, err := url.Parse(frontendBaseURL + "/ramas/comparar")
	if err != nil {
		slog.Warn("FRONTEND_BASE_URL no es válida. La notificación de conflicto no incluirá enlace de comparación.", "error", err)
		return ""
	}

	query := comparisonURL.Query()
	query.Set("projectId", projectID)
	query.Set("from", sourceBranch)
	query.Set("to", targetBranch)
	comparisonURL.RawQuery = query.Encode()

	return comparisonURL.String()
}

func buildAS400DashboardURL(frontendBaseURL, solicitudID string) string {
	frontendBaseURL = strings.TrimRight(strings.TrimSpace(frontendBaseURL), "/")
	if frontendBaseURL == "" {
		slog.Warn("FRONTEND_BASE_URL no está definida. La notificación de AS400 no incluirá enlace a la herramienta.")
		return ""
	}

	path := "/solicitudes"
	// El detalle usa el ID numérico sin "R" ni ceros a la izquierda: R001007206 -> req-1007206
	numeric := strings.TrimLeft(strings.TrimSpace(solicitudID), "rR")
	if n, convErr := strconv.Atoi(numeric); convErr == nil && n > 0 {
		path += "/req-" + strconv.Itoa(n)
	}

	dashboardURL, err := url.Parse(frontendBaseURL + path)
	if err != nil {
		slog.Warn("FRONTEND_BASE_URL no es válida. La notificación de AS400 no incluirá enlace a la herramienta.", "error", err)
		return ""
	}

	return dashboardURL.String()
}

// 2. Notificación de Aprobación en el Flujo (NUEVO)
func (s *EmailService) EnviarNotificacionAprobacion(ctx context.Context, destinatario, branchName, faseAprobada, aprobador, repositorio string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "✅ Aprobación Exitosa: Rama " + branchName,
		TipoCuerpo: "plantilla",
		Plantilla:  "aprobacion-flujo",
		Destino:    []string{destinatario},
		Datos: []models.DatoDinamico{
			{Clave: "rama", Valor: branchName},
			{Clave: "fase", Valor: faseAprobada},
			{Clave: "aprobador", Valor: aprobador},
			{Clave: "repositorio", Valor: repositorio},
			{Clave: "fecha", Valor: time.Now().Format("2006-01-02 15:04:05")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 3. Notificación de Creación desde AS400 (Éxito)
func (s *EmailService) EnviarNotificacionAS400(ctx context.Context, destinatario, solicitudID, tipoSolicitud, filasHTML string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "🚀 Repositorios AS400 Generados: Solicitud " + solicitudID,
		TipoCuerpo: "plantilla",
		Plantilla:  "as400-creacion",
		Destino:    []string{destinatario},
		Datos: []models.DatoDinamico{
			{Clave: "titulo", Valor: "Tramas Procesadas Exitosamente"},
			{Clave: "mensaje", Valor: "Las siguientes tramas del AS400 fueron procesadas correctamente y se ha creado la estructura en GitLab."},
			{Clave: "status_color", Valor: "#10b981"}, // Verde
			{Clave: "status_icon", Valor: "✅"},
			{Clave: "status_label", Valor: "COMPLETADO"},
			{Clave: "repositorio", Valor: "Repositorios AS400"},
			{Clave: "tipo_solicitud", Valor: tipoSolicitud},
			{Clave: "solicitud", Valor: solicitudID},
			{Clave: "nombre_destinatario", Valor: "Desarrollador"},
			{Clave: "fuentes_filas", Valor: filasHTML},
			{Clave: "fuentes_nota_truncado", Valor: "Estos repositorios ya están listos para ser trabajados."},
			{Clave: "cta_url", Valor: buildAS400DashboardURL(os.Getenv("FRONTEND_BASE_URL"), solicitudID)},
			{Clave: "cta_texto", Valor: "Ver en GitLab"},
			{Clave: "footer_texto", Valor: "Notificación automática del orquestador de AS400"},
			{Clave: "footer_year", Valor: time.Now().Format("2006")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 4. Alerta de Flujo Incorrecto
func (s *EmailService) EnviarAlertaFlujo(ctx context.Context, destinatario, ramaOrigen, ramaDestino string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "⚠️ Acción Requerida: Flujo de Ramas Incorrecto",
		TipoCuerpo: "plantilla",
		Plantilla:  "alerta-flujo",
		Destino:    []string{destinatario},
		Datos: []models.DatoDinamico{
			{Clave: "rama_origen", Valor: ramaOrigen},
			{Clave: "rama_destino", Valor: ramaDestino},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 5. Envío genérico directo (Conservado por retrocompatibilidad)
func (s *EmailService) EnviarNotificacion(ctx context.Context, destinatario, asunto, cuerpoHTML string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     asunto,
		TipoCuerpo: "cuerpo", // Indica a la API que envíe el HTML directo sin plantilla
		Cuerpo:     cuerpoHTML,
		Destino:    []string{destinatario},
	}

	return s.EnviarPeticionAPI(payload)
}

// 6. Notificación de Commit/Push registrado
func (s *EmailService) EnviarNotificacionCommit(ctx context.Context, destinatario, branchName, desarrollador, mensajeCommit string, cantidadArchivos int) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "📝 Nuevo Commit registrado en la rama: " + branchName,
		TipoCuerpo: "plantilla",
		Plantilla:  "commit-registrado",
		Destino:    []string{destinatario},
		Datos: []models.DatoDinamico{
			{Clave: "rama", Valor: branchName},
			{Clave: "desarrollador", Valor: desarrollador},
			{Clave: "mensaje_commit", Valor: mensajeCommit},
			{Clave: "cantidad_archivos", Valor: strconv.Itoa(cantidadArchivos)},
			{Clave: "fecha", Valor: time.Now().Format("2006-01-02 15:04:05")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 7. Notificación de Rollback Manual
func (s *EmailService) EnviarNotificacionRollbackManual(ctx context.Context, destinatario, branchName, commitSha, ejecutadoPor, motivo, repositorio string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "⏪ Alerta: Rollback Manual Ejecutado en " + branchName,
		TipoCuerpo: "plantilla",
		Plantilla:  "rollback-manual",
		Destino:    []string{destinatario},
		Datos: []models.DatoDinamico{
			{Clave: "rama", Valor: branchName},
			{Clave: "commit_sha", Valor: commitSha},
			{Clave: "ejecutado_por", Valor: ejecutadoPor},
			{Clave: "motivo", Valor: motivo},
			{Clave: "repositorio", Valor: repositorio},
			{Clave: "fecha", Valor: time.Now().Format("2006-01-02 15:04:05")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 8. Notificación de Rollback Automático
func (s *EmailService) EnviarNotificacionRollbackAutomatico(ctx context.Context, destinatarios []string, branchName string, cantidadDesarrolladores int, ramaBackup string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "🔄 Rollback Automático Ejecutado: " + branchName,
		TipoCuerpo: "plantilla",
		Plantilla:  "rollback-automatico",
		Destino:    destinatarios,
		Datos: []models.DatoDinamico{
			{Clave: "rama", Valor: branchName},
			{Clave: "cantidad_desarrolladores", Valor: strconv.Itoa(cantidadDesarrolladores)},
			{Clave: "desarrolladores_involucrados", Valor: strings.Join(destinatarios, ", ")},
			{Clave: "rama_backup", Valor: ramaBackup},
			{Clave: "fecha", Valor: time.Now().Format("2006-01-02 15:04:05")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 9. Notificación de Conflicto Resuelto
func (s *EmailService) EnviarNotificacionConflictoResuelto(ctx context.Context, destinatarios []string, branchName string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "✅ Conflicto resuelto en la rama: " + branchName,
		TipoCuerpo: "plantilla",
		Plantilla:  "conflicto-resuelto",
		Destino:    destinatarios,
		Datos: []models.DatoDinamico{
			{Clave: "rama_afectada", Valor: branchName},
			{Clave: "instrucciones", Valor: "Los conflictos de código han sido solucionados exitosamente. La rama vuelve a estar activa y el Merge Request ya se puede fusionar."},
			{Clave: "fecha", Valor: time.Now().Format("2006-01-02 15:04:05")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}

// 10. Notificación de Error AS400 (NUEVO)
func (s *EmailService) EnviarNotificacionErrorAS400(ctx context.Context, destinatario, solicitudID, tipoSolicitud, filasHTML string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	payload := models.EmailPayload{
		Asunto:     "⚠️ Alerta: Problemas sincronizando tramas del AS400",
		TipoCuerpo: "plantilla",
		Plantilla:  "as400-creacion", // Usa la misma plantilla que las de éxito
		Destino:    []string{destinatario},
		Datos: []models.DatoDinamico{
			{Clave: "titulo", Valor: "Fuentes no procesadas"},
			{Clave: "mensaje", Valor: "Las siguientes fuentes presentaron inconvenientes durante la creación o ya existían previamente:"},
			{Clave: "status_color", Valor: "#ef4444"}, // Rojo
			{Clave: "status_icon", Valor: "⚠️"},
			{Clave: "status_label", Valor: "ERROR / AVISO"},
			{Clave: "repositorio", Valor: "Repositorios AS400"},
			{Clave: "tipo_solicitud", Valor: tipoSolicitud},
			{Clave: "solicitud", Valor: solicitudID},
			{Clave: "nombre_destinatario", Valor: "Desarrollador"},
			{Clave: "fuentes_filas", Valor: filasHTML},
			{Clave: "fuentes_nota_truncado", Valor: "Revisa los logs del contenedor para más detalle técnico."},
			{Clave: "cta_url", Valor: buildAS400DashboardURL(os.Getenv("FRONTEND_BASE_URL"), solicitudID)},
			{Clave: "cta_texto", Valor: "Ir al Dashboard"},
			{Clave: "footer_texto", Valor: "Notificación automática del orquestador de AS400"},
			{Clave: "footer_year", Valor: time.Now().Format("2006")},
		},
	}

	return s.EnviarPeticionAPI(payload)
}
