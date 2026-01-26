CREATE TABLE `assessmentResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`questionId` varchar(64) NOT NULL,
	`category` varchar(50) NOT NULL,
	`answerText` text NOT NULL,
	`points` int NOT NULL,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`totalScore` int NOT NULL,
	`riskLevel` enum('low','moderate','high') NOT NULL,
	`categoryScores` json NOT NULL,
	`categoryPercentages` json NOT NULL,
	`highestRiskCategories` json NOT NULL,
	`interpretation` text NOT NULL,
	`recommendations` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentResults_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessmentResults_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`userAgent` text,
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessments_sessionId_unique` UNIQUE(`sessionId`)
);
