<?php
/**
 * Zirian EV Charging Solutions - SMTP Mail Helper
 * Sends HTML emails using sockets (no external dependencies)
 */

function enviarCorreoSMTP($asunto, $cuerpoHtml) {
    $smtpHost = "smtp.titan.email";
    $smtpPort = 465;
    $smtpUser = "admin@alddea.com";
    $smtpPass = "g8LccgL6hy(N43Aw";
    $smtpFrom = "admin@alddea.com";
    $smtpTo   = "rodrigo@zirian.com"; // El correo receptor de los formularios

    // Abrir conexión socket segura SSL
    $socket = fsockopen("ssl://" . $smtpHost, $smtpPort, $errno, $errstr, 15);
    if (!$socket) {
        error_log("SMTP Connection failed: $errstr ($errno)");
        return false;
    }

    // Función auxiliar para leer y validar la respuesta del servidor SMTP
    $readResponse = function($expected) use ($socket) {
        $response = '';
        while (substr($response, 3, 1) !== ' ') {
            $line = fgets($socket, 512);
            if ($line === false) break;
            $response .= $line;
        }
        $code = substr($response, 0, 3);
        if ($code !== (string)$expected) {
            error_log("SMTP Error: Expected $expected, got: $response");
            return false;
        }
        return true;
    };

    if (!$readResponse(220)) { fclose($socket); return false; }

    fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\r\n");
    if (!$readResponse(250)) { fclose($socket); return false; }

    fwrite($socket, "AUTH LOGIN\r\n");
    if (!$readResponse(334)) { fclose($socket); return false; }

    fwrite($socket, base64_encode($smtpUser) . "\r\n");
    if (!$readResponse(334)) { fclose($socket); return false; }

    fwrite($socket, base64_encode($smtpPass) . "\r\n");
    if (!$readResponse(235)) { fclose($socket); return false; }

    fwrite($socket, "MAIL FROM: <$smtpFrom>\r\n");
    if (!$readResponse(250)) { fclose($socket); return false; }

    fwrite($socket, "RCPT TO: <$smtpTo>\r\n");
    if (!$readResponse(250)) { fclose($socket); return false; }

    fwrite($socket, "DATA\r\n");
    if (!$readResponse(354)) { fclose($socket); return false; }

    // Cabeceras MIME para HTML en UTF-8
    $headers = [
        "MIME-Version: 1.0",
        "Content-type: text/html; charset=utf-8",
        "To: <$smtpTo>",
        "From: Zirian Web Notification <$smtpFrom>",
        "Subject: =?UTF-8?B?" . base64_encode($asunto) . "?=",
        "Date: " . date("r"),
        "Message-ID: <" . time() . "-" . uniqid() . "@" . ($smtpHost) . ">"
    ];

    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . $cuerpoHtml . "\r\n.\r\n";
    fwrite($socket, $emailData);
    if (!$readResponse(250)) { fclose($socket); return false; }

    fwrite($socket, "QUIT\r\n");
    fclose($socket);

    return true;
}
