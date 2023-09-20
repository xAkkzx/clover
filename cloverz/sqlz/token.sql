create DATABASE IF NOT EXISTS token;
USE DATABASE token;

CREATE TABLE `tokenSpesi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tkPrompt` int NOT NULL,
  `tkComple` int NOT NULL,
  `prompt` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `comple` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `feedback` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci