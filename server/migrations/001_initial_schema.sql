
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    materials_url TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration INTEGER, -- in seconds
    order_index INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL, -- using session instead of user for shared login
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 NOT NULL,
    last_watched_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_progress_session_id ON progress(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(order_index);

-- Insert sample data for development
INSERT INTO modules (title, description, image_url, order_index, is_active) VALUES
('Fundamentos de Programação', 'Aprenda os conceitos básicos da programação', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', 1, true),
('Desenvolvimento Web', 'HTML, CSS, JavaScript e frameworks modernos', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500', 2, true),
('Banco de Dados', 'SQL, PostgreSQL e design de banco de dados', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500', 3, true),
('DevOps e Deploy', 'Git, CI/CD e deployment de aplicações', 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (module_id, title, description, video_url, duration, order_index, is_active) VALUES
-- Module 1: Fundamentos de Programação
(1, 'Introdução à Programação', 'Conceitos básicos e o que é programação', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 480, 1, true),
(1, 'Variáveis e Tipos de Dados', 'Aprenda sobre variáveis e tipos primitivos', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 720, 2, true),
(1, 'Estruturas de Controle', 'If, else, loops e estruturas condicionais', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 900, 3, true),
(1, 'Funções e Métodos', 'Como criar e usar funções em programação', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 600, 4, true),

-- Module 2: Desenvolvimento Web
(2, 'HTML Básico', 'Estrutura e elementos HTML', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 540, 1, true),
(2, 'CSS e Estilização', 'Estilos, layouts e responsividade', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 780, 2, true),
(2, 'JavaScript Fundamentals', 'Programação client-side com JavaScript', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 960, 3, true),
(2, 'React Básico', 'Introdução ao framework React', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 840, 4, true),

-- Module 3: Banco de Dados
(3, 'Introdução ao SQL', 'Comandos básicos de SQL', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 720, 1, true),
(3, 'PostgreSQL Setup', 'Configuração e primeiros passos', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 600, 2, true),
(3, 'Relacionamentos e JOINs', 'Trabalhando com tabelas relacionadas', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 900, 3, true),

-- Module 4: DevOps e Deploy
(4, 'Git e Controle de Versão', 'Gerenciamento de código com Git', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 660, 1, true),
(4, 'Deploy com Replit', 'Como fazer deploy de aplicações', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 480, 2, true)
ON CONFLICT DO NOTHING;
