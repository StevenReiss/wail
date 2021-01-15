#! /bin/csh -f

set host = '-h bdognom-v2'
set db = wail
set dbuser = '-u spr'

mysql $host $dbuser <<EOF
DROP DATABASE $db;
EOF

mysql $host $dbuser <<EOF
CREATE DATABASE $db;
EOF


mysql $host $db $dbuser <<EOF

CREATE TABLE students (
  bannerid character(16) NOT NULL,
  name	   character(64),
  PRIMARY KEY (bannerid)
);


CREATE TABLE admin (
   id character(16),
   password character(64)
);


CREATE TABLE grades (
   bannerid character(16) NOT NULL,
   lesson character(64) NOT NULL,
   finished timestamp default CURRENT_TIMESTAMP,
   PRIMARY KEY (bannerid,lesson)
);


CREATE TABLE lessons (
   number int AUTO_INCREMENT,
   name character(255) NOT NULL,
   id character(16) NOT NULL,
   module character(32) NOT NULL,
   description text,
   reference character(16),
   enabled boolean DEFAULT false,
   inited boolean DEFAULT false,
   active date DEFAULT (DATE_FORMAT(NOW(), '%Y-%m-%d')),
   PRIMARY KEY ( number )
);
CREATE INDEX lessonNameIndex on lessons(name);


GRANT SELECT on wail.* to 'cs132'@'%';
GRANT ALL on wail.* to 'wail'@'%';


INSERT INTO admin (id, password)
VALUES ( 'admin', 'cb7a5742346e1c8560443d0d9b4bb7e1d3426500709d924a2e9fa7dd36984907' ),
       ( 'adminta', '50ade8c8828b23d1df1da2788ae64d36eb5a49f256ffde400313a1b3886cedb5' );



INSERT INTO lessons (name,id,module,reference,description)
VALUES
   ('Html Css Lab','htmlcss', 'frontendlesson', NULL, "Lesson support for Html/Css Lab" ),
   ("Design 1", "design1", "designlesson", NULL, "Quick Web Page Design Example" ),
   ("Crits 1", "crits1", "critslesson", "design1", "Crits on Quick Web Page Design Example" ),
   ("Design 2", "design2", "designlesson", 'crits1', "Quick Web Page Redesign Example" ),
   ("Crits 2", "crits2", "critslesson", "design2", "Crits on Quick Web Page Redesign Example" ),
   ("Design 3", "design3", "designlesson", 'crits2', "Quick Web Page Redesign Example" ),
   ("SQL Injection", "sqlinjection", "sqlinjectionlesson", NULL, "SQL Injection Attacks" ),
   ("XSS Attack", "xss", "xsslesson", NULL, "Cross-Site Scripting Attacks" ),
   ("Define User Test", "usertest1", "usertestlesson", NULL, "Define a user test for your final project" ),
   ('Take a User Test', 'taketest1', 'usertestlesson', 'usertest1', "Take a uesr test for another project" );
EOF

csh ~/courses/cs132/students.sql


mysql $host $db $dbuser <<EOF

INSERT INTO students (name,bannerid)
VALUES
   ("Test Student","bxxx"),
   ("TA1","bta1"),
   ("TA2","bta2"),
   ("TA3","bta3"),
   ("TA4","bta4"),
   ("TA5","bta5"),
   ("TA6","bta6"),
   ("TA7","bta7");

EOF

rm -rf ../server/files/*
ssh -t pk-ssh.cs.brown.edu "ssh bdognom-v2 rm -rf '/vol/wail/server/files/*'"
