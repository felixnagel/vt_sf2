-- phpMyAdmin SQL Dump
-- version 4.3.11
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 02. Mrz 2018 um 17:24
-- Server-Version: 5.6.24
-- PHP-Version: 5.6.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `velotile_sf2`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roles` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `updated_at`, `roles`) VALUES
(2, 'elfixlange@gmail.com', '$2y$13$CWGvXhiweK74/R7Ti17DUOnUseSYL4cfLyT6BiYJOw38nUIO8O.nC', '2016-08-14 19:49:01', '2016-08-14 19:49:01', 'ROLE_PLAYER');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vt_map`
--

CREATE TABLE IF NOT EXISTS `vt_map` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `released_at` datetime DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `blocks` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `vt_map`
--

INSERT INTO `vt_map` (`id`, `title`, `released_at`, `created_by`, `blocks`) VALUES
(1, 'test', NULL, 2, 'e01:3:2:0|e01:8:5:0|e01:7:7:0|c01:11:9:0|c01:12:8:0|c01:13:7:0|c01:14:5:0|c01:10:4:0|c01:10:6:0|c01:2:4:0|c01:8:2:0|c01:13:2:0|e01:5:4:0|c22:2:7:0|e01:8:6:0|e01:4:3:0|c02:11:1:0|c02:10:2:0|c02:12:2:0|c02:12:1:0|c02:10:1:0|c02:10:3:0|e21:9:8:0|e21:10:7:0|c22:4:4:270|c22:4:2:90|c11:3:3:270|c11:5:3:90|e01:0:1:0|e01:1:1:0|c22:2:2:270|c23:2:1:90|c11:3:1:90|e22:6:3:0|e22:6:4:180|e22:8:3:90|e01:7:3:0|e01:8:4:0|e21:7:4:270|e21:7:6:0|e22:8:7:180|e12:4:7:270|s23:5:7:270|e01:6:7:0|e12:2:9:180|e23:2:8:180|e23:2:10:90|c22:2:11:270|e12:4:11:90|s13:5:11:0|e01:6:11:0|e22:7:10:0|e22:8:9:0|e22:7:11:180|e22:8:10:180|e23:9:9:180|e22:10:8:180|e22:11:7:180|e22:12:6:180|e21:11:6:0|e01:12:3:0|e23:3:7:180|e21:3:8:180|e23:3:11:90|e21:3:10:90|e01:12:5:0|e01:12:4:0|start_1:0:1:0|cp1:5:4:0|cp1:6:7:0|cp1:6:11:0|cp1:9:9:0|cp1:12:3:0');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vt_player`
--

CREATE TABLE IF NOT EXISTS `vt_player` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pw` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `vt_player`
--

INSERT INTO `vt_player` (`id`, `email`, `pw`, `name`, `role`, `created_at`, `updated_at`) VALUES
(8, 'elfixlange@gmail.com', '$2y$04$586UCdnMdrFGOEd4.sz/fO.akoNs4bxSDCWGTMIqQ.L92JQX381gy', 'QGR', 'player', '2016-08-02 21:42:21', '2016-08-02 21:42:21');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vt_times`
--

CREATE TABLE IF NOT EXISTS `vt_times` (
  `id` int(11) NOT NULL,
  `map_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `player_id` int(11) NOT NULL,
  `finish_time` double DEFAULT NULL,
  `checkpoint_times` longtext COLLATE utf8mb4_unicode_ci COMMENT '(DC2Type:simple_array)'
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `vt_times`
--

INSERT INTO `vt_times` (`id`, `map_id`, `created_at`, `player_id`, `finish_time`, `checkpoint_times`) VALUES
(12, 1, '2018-03-01 14:29:15', 2, 10.758, '1.906,4.475,7.889,8.845,10.758');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `vt_map`
--
ALTER TABLE `vt_map`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `vt_player`
--
ALTER TABLE `vt_player`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `vt_times`
--
ALTER TABLE `vt_times`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT für Tabelle `vt_map`
--
ALTER TABLE `vt_map`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT für Tabelle `vt_player`
--
ALTER TABLE `vt_player`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT für Tabelle `vt_times`
--
ALTER TABLE `vt_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=13;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
