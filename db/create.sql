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

   PRIMARY KEY ( number )
);
CREATE INDEX lessonNameIndex on lessons(name);
			

GRANT SELECT on wail.* to 'cs132'@'%';

INSERT INTO admin (id, password)
VALUES ( 'admin', 'cb7a5742346e1c8560443d0d9b4bb7e1d3426500709d924a2e9fa7dd36984907' ),
       ( 'adminta', '50ade8c8828b23d1df1da2788ae64d36eb5a49f256ffde400313a1b3886cedb5' );


INSERT INTO lessons (name,id,module,reference,description)
VALUES
   ("Design 1", "design1", "designlesson", NULL, "Quick Web Page Design Example" ),
   ("Crits 1", "crits1", "critslesson", "design1", "Crits on Quick Web Page Design Example" ),
   ("SQL Injection", "sqlinjection", "sqlinjectionlesson", NULL, "SQL Injection Attacks" );


UPDATE lessons set enabled = true WHERE name = 'Design 1';

EOF

csh ~/courses/cs132/students.sql


#    ("Crits 1", "crits1" , "critslesson" , "Provide Feedback on Quick Web Page Design" );













