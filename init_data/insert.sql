INSERT INTO users     (user_id,username,password) VALUES
('1','test','test');
INSERT INTO trips (trip_id,user_id,start_date,end_date) VALUES
('1','1','1990-01-01','2023-01-01');
INSERT INTO activities (activity_id,trip_id,title,description,location) VALUES
('1','1','testtitle','testdescription','testlocation');