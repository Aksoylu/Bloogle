-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 17 Oca 2023, 14:04:21
-- Sunucu sürümü: 10.4.17-MariaDB
-- PHP Sürümü: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `saag_authentication`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `auth_hash` varchar(32) NOT NULL,
  `username` varchar(64) NOT NULL,
  `password` varchar(32) NOT NULL,
  `email` varchar(128) NOT NULL,
  `full_name` varchar(128) NOT NULL,
  `profile_picture` varchar(32) NOT NULL,
  `bio` varchar(1024) NOT NULL,
  `created_at` int(11) NOT NULL,
  `is_verified` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Tablo döküm verisi `user`
--

INSERT INTO `user` (`id`, `auth_hash`, `username`, `password`, `email`, `full_name`, `profile_picture`, `bio`, `created_at`, `is_verified`) VALUES
(1, '69D241A56CCEC5970A565635FD1FFAB4', 'umitaksoylu', '202CB962AC59075B964B07152D234B70', 'umitaksoylu98@gmail.com', 'Ümit Aksoylu', 'e8f9ad8e2b9e76699f8a6cd2e468ec93', 'Software Engineer, Author, Opensource lover', 1638306000, 0);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `user_verification`
--

CREATE TABLE `user_verification` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code` varchar(8) NOT NULL,
  `process` int(11) NOT NULL,
  `expire_time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `world_containers`
--

CREATE TABLE `world_containers` (
  `id` int(11) NOT NULL,
  `endpoint` text NOT NULL,
  `capacity` int(11) NOT NULL,
  `registered_user_count` int(11) NOT NULL,
  `active_user_count` int(11) NOT NULL,
  `server_name` varchar(64) NOT NULL,
  `server_hash` varchar(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tablo döküm verisi `world_containers`
--

INSERT INTO `world_containers` (`id`, `endpoint`, `capacity`, `registered_user_count`, `active_user_count`, `server_name`, `server_hash`) VALUES
(1, 'http://127.0.0.1:4040/', 2500, 0, 0, 'Alpha', 'a18n23');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `world_records`
--

CREATE TABLE `world_records` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `world_hash` int(11) NOT NULL,
  `creation_date` int(11) NOT NULL,
  `document_id` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `user_verification`
--
ALTER TABLE `user_verification`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `world_containers`
--
ALTER TABLE `world_containers`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `world_records`
--
ALTER TABLE `world_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `world_hash` (`world_hash`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Tablo için AUTO_INCREMENT değeri `user_verification`
--
ALTER TABLE `user_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `world_containers`
--
ALTER TABLE `world_containers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Tablo için AUTO_INCREMENT değeri `world_records`
--
ALTER TABLE `world_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
