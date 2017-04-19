-- phpMyAdmin SQL Dump
-- version 4.3.11
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 19. Apr 2017 um 20:15
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
(1, 'test', NULL, 2, 'start_1:0:0:0|e01:0:1:0|e22:1:0:270|e01:2:0:0|e22:2:1:270|e01:1:2:0|e01:3:1:0|e01:3:0:0|c12:2:3:90|e01:1:3:0|e01:3:4:0|e01:2:4:0|e01:1:4:0|c23:3:2:270|c22:4:2:180|e01:4:4:0|c13:5:3:0|s11:4:3:0|e01:5:4:0|e12:5:2:0|c13:5:1:270|c12:4:1:90|c12:4:0:180|e23:6:0:270|e22:6:1:90|e21:5:0:270|checkpoint_1:7:1:90|e01:7:0:0|e01:8:0:0|e01:8:1:0|e01:6:2:0|e01:8:2:0|c02:7:3:0|e22:8:3:270|e01:9:0:0|e01:9:1:0|e01:9:2:0|e01:9:3:0|e01:9:4:0|e01:9:5:0|e01:9:6:0|e01:8:6:0|e01:7:6:0|e01:6:6:0|e01:5:6:0|checkpoint_1:8:4:90|checkpoint_1:5:5:180|e01:6:3:0|e01:6:4:0|c12:8:5:0|e22:7:4:90|e01:4:6:0|e01:3:6:0|e01:1:6:0|e01:2:6:0|e01:0:6:0|e01:0:5:0|e01:0:4:0|checkpoint_1:1:5:0|checkpoint_2:2:2:90|checkpoint_2:2:3:0|checkpoint_3:5:2:270|checkpoint_1:5:0:0|e01:0:2:0|e22:1:1:90');

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
  `finish_time` int(11) DEFAULT NULL,
  `checkpoint_times` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `vt_times`
--

INSERT INTO `vt_times` (`id`, `map_id`, `created_at`, `player_id`, `finish_time`, `checkpoint_times`) VALUES
(1, 1, '2017-04-18 23:21:51', 2, 15860, '6102|7253|9305|11323|12090|13141|14676|15860');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;