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



CREATE TABLE lessons (
   number int AUTO_INCREMENT,
   name character(255) NOT NULL,
   id character(16) NOT NULL,
   module character(32) NOT NULL,
   description text,
   reference character(16),
   enabled boolean DEFAULT false,
   inited boolean DEFAULT false,

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
   ("Design 1", "design1", "designlesson", NULL, "Quick Web Page Design Example" ),
   ("Crits 1", "crits1", "critslesson", "design1", "Crits on Quick Web Page Design Example" ),
   ("Design 2", "design2", "designlesson", NULL, "Quick Web Page Redesign Example" ),
   ("SQL Injection", "sqlinjection", "sqlinjectionlesson", NULL, "SQL Injection Attacks" ),
   ("XSS Attack", "xss", "xsslesson", NULL, "Cross-Site Scripting Attacks" ),
   ("Define User Test", "usertest1", "usertestlesson", NULL, "Define a user test for your final project" ),
   ('Take a User Test', 'taketest1', 'usertestlesson', NULL, "Take a uesr test for another project" );

UPDATE lessons set enabled = true WHERE name = 'Design 1';

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
