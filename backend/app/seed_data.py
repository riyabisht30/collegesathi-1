"""
Seed script to populate the database with realistic Indian college data.
Run with: python -m app.seed_data
"""
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.models import (
    College, Course, EntranceExam, Cutoff, AdmissionRound,
    college_courses, college_exams
)

# Drop and recreate all tables (handles schema changes)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


# ==================== REAL DATA ====================

STATES = [
    "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
    "West Bengal", "Rajasthan", "Gujarat", "Madhya Pradesh", "Telangana",
    "Andhra Pradesh", "Kerala", "Punjab", "Haryana", "Bihar",
    "Odisha", "Jharkhand", "Assam", "Uttarakhand", "Himachal Pradesh",
    "Goa", "Chandigarh", "Jammu and Kashmir", "Puducherry", "Manipur",
]

CITIES_BY_STATE = {
    "Delhi": ["New Delhi", "South Delhi", "North Delhi", "East Delhi"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Vellore"],
    "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi", "Allahabad", "Agra", "Kanpur", "Aligarh"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Kharagpur"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Pilani"],
    "Gujarat": ["Ahmedabad", "Vadodara", "Surat", "Gandhinagar", "Rajkot"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
    "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Patiala", "Jalandhar"],
    "Haryana": ["Gurugram", "Faridabad", "Rohtak", "Hisar", "Sonipat"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    "Assam": ["Guwahati", "Jorhat", "Silchar", "Tezpur"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Nainital"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Chandigarh": ["Chandigarh"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Puducherry": ["Puducherry"],
    "Manipur": ["Imphal"],
}

# Real colleges data (name, state, city, type, nirf_approx, naac, established)
REAL_COLLEGES = [
    # Top IITs
    ("Indian Institute of Technology Bombay", "Maharashtra", "Mumbai", "Government", 3, "A++", 1958),
    ("Indian Institute of Technology Delhi", "Delhi", "New Delhi", "Government", 2, "A++", 1961),
    ("Indian Institute of Technology Madras", "Tamil Nadu", "Chennai", "Government", 1, "A++", 1959),
    ("Indian Institute of Technology Kanpur", "Uttar Pradesh", "Kanpur", "Government", 4, "A++", 1959),
    ("Indian Institute of Technology Kharagpur", "West Bengal", "Kharagpur", "Government", 5, "A++", 1951),
    ("Indian Institute of Technology Roorkee", "Uttarakhand", "Roorkee", "Government", 6, "A++", 1847),
    ("Indian Institute of Technology Guwahati", "Assam", "Guwahati", "Government", 7, "A++", 1994),
    ("Indian Institute of Technology Hyderabad", "Telangana", "Hyderabad", "Government", 8, "A+", 2008),
    ("Indian Institute of Technology BHU Varanasi", "Uttar Pradesh", "Varanasi", "Government", 10, "A++", 1919),
    ("Indian Institute of Technology Indore", "Madhya Pradesh", "Indore", "Government", 11, "A+", 2009),
    ("Indian Institute of Technology Dhanbad", "Jharkhand", "Dhanbad", "Government", 12, "A+", 1926),
    ("Indian Institute of Technology Patna", "Bihar", "Patna", "Government", 23, "A+", 2008),
    ("Indian Institute of Technology Jodhpur", "Rajasthan", "Jodhpur", "Government", 28, "A", 2008),
    ("Indian Institute of Technology Mandi", "Himachal Pradesh", "Mandi", "Government", 32, "A", 2009),
    ("Indian Institute of Technology Gandhinagar", "Gujarat", "Gandhinagar", "Government", 22, "A+", 2008),
    
    # Top NITs
    ("National Institute of Technology Tiruchirappalli", "Tamil Nadu", "Trichy", "Government", 9, "A++", 1964),
    ("National Institute of Technology Surathkal", "Karnataka", "Mangalore", "Government", 13, "A+", 1960),
    ("National Institute of Technology Warangal", "Telangana", "Warangal", "Government", 15, "A+", 1959),
    ("National Institute of Technology Rourkela", "Odisha", "Rourkela", "Government", 16, "A+", 1961),
    ("National Institute of Technology Calicut", "Kerala", "Kozhikode", "Government", 20, "A+", 1961),
    ("Visvesvaraya National Institute of Technology", "Maharashtra", "Nagpur", "Government", 18, "A+", 1960),
    ("Motilal Nehru National Institute of Technology", "Uttar Pradesh", "Allahabad", "Government", 25, "A", 1961),
    ("Maulana Azad National Institute of Technology", "Madhya Pradesh", "Bhopal", "Government", 30, "A", 1960),
    ("National Institute of Technology Durgapur", "West Bengal", "Durgapur", "Government", 35, "A", 1960),
    ("National Institute of Technology Jamshedpur", "Jharkhand", "Jamshedpur", "Government", 50, "A", 1960),
    
    # Top Universities
    ("University of Delhi", "Delhi", "New Delhi", "Government", 14, "A++", 1922),
    ("Jawaharlal Nehru University", "Delhi", "New Delhi", "Government", 17, "A++", 1969),
    ("Banaras Hindu University", "Uttar Pradesh", "Varanasi", "Government", 19, "A++", 1916),
    ("University of Hyderabad", "Telangana", "Hyderabad", "Government", 21, "A++", 1974),
    ("Jadavpur University", "West Bengal", "Kolkata", "Government", 24, "A+", 1955),
    ("Anna University", "Tamil Nadu", "Chennai", "Government", 26, "A+", 1978),
    ("Savitribai Phule Pune University", "Maharashtra", "Pune", "Government", 27, "A+", 1949),
    ("Aligarh Muslim University", "Uttar Pradesh", "Aligarh", "Government", 29, "A+", 1920),
    ("University of Mumbai", "Maharashtra", "Mumbai", "Government", 33, "A+", 1857),
    ("Calcutta University", "West Bengal", "Kolkata", "Government", 36, "A", 1857),
    ("Osmania University", "Telangana", "Hyderabad", "Government", 40, "A+", 1918),
    ("Panjab University", "Chandigarh", "Chandigarh", "Government", 38, "A", 1882),
    ("University of Rajasthan", "Rajasthan", "Jaipur", "Government", 55, "A", 1947),
    ("Gujarat University", "Gujarat", "Ahmedabad", "Government", 60, "B++", 1949),
    ("University of Kerala", "Kerala", "Thiruvananthapuram", "Government", 45, "A", 1937),
    ("Bangalore University", "Karnataka", "Bangalore", "Government", 48, "A", 1964),
    ("Madras University", "Tamil Nadu", "Chennai", "Government", 42, "A+", 1857),
    
    # Top Private Universities
    ("BITS Pilani", "Rajasthan", "Pilani", "Deemed", 26, "A", 1964),
    ("Vellore Institute of Technology", "Tamil Nadu", "Vellore", "Deemed", 11, "A++", 1984),
    ("Manipal Academy of Higher Education", "Karnataka", "Mangalore", "Deemed", 15, "A++", 1953),
    ("SRM Institute of Science and Technology", "Tamil Nadu", "Chennai", "Deemed", 19, "A++", 1985),
    ("Amity University", "Uttar Pradesh", "Noida", "Private", 30, "A+", 2005),
    ("Lovely Professional University", "Punjab", "Jalandhar", "Private", 35, "A+", 2005),
    ("Symbiosis International University", "Maharashtra", "Pune", "Deemed", 22, "A++", 2002),
    ("Christ University", "Karnataka", "Bangalore", "Deemed", 28, "A++", 1969),
    ("Ashoka University", "Haryana", "Sonipat", "Private", 45, "A", 2014),
    ("Shiv Nadar University", "Uttar Pradesh", "Noida", "Private", 50, "A", 2011),
    ("OP Jindal Global University", "Haryana", "Sonipat", "Private", 40, "A+", 2009),
    ("Thapar Institute of Engineering and Technology", "Punjab", "Patiala", "Deemed", 33, "A+", 1956),
    ("KIIT University", "Odisha", "Bhubaneswar", "Deemed", 20, "A++", 1992),
    ("Chandigarh University", "Punjab", "Chandigarh", "Private", 25, "A+", 2012),
    ("Bennett University", "Uttar Pradesh", "Noida", "Private", 80, "A", 2016),
    ("Jain University", "Karnataka", "Bangalore", "Deemed", 55, "A++", 1990),
    ("Nirma University", "Gujarat", "Ahmedabad", "Private", 58, "A", 1995),
    ("PESIT Bangalore", "Karnataka", "Bangalore", "Private", 62, "A", 1972),
    ("RV College of Engineering", "Karnataka", "Bangalore", "Private", 65, "A", 1963),
    ("MS Ramaiah Institute of Technology", "Karnataka", "Bangalore", "Private", 70, "A", 1962),
    
    # Medical colleges
    ("All India Institute of Medical Sciences Delhi", "Delhi", "New Delhi", "Government", 1, "A++", 1956),
    ("AIIMS Jodhpur", "Rajasthan", "Jodhpur", "Government", 10, "A+", 2012),
    ("AIIMS Bhopal", "Madhya Pradesh", "Bhopal", "Government", 12, "A+", 2012),
    ("Christian Medical College Vellore", "Tamil Nadu", "Vellore", "Private", 2, "A++", 1900),
    ("JIPMER Puducherry", "Puducherry", "Puducherry", "Government", 5, "A++", 1823),
    ("Armed Forces Medical College", "Maharashtra", "Pune", "Government", 8, "A+", 1948),
    ("King George Medical University", "Uttar Pradesh", "Lucknow", "Government", 15, "A+", 1911),
    ("Seth GS Medical College", "Maharashtra", "Mumbai", "Government", 7, "A+", 1926),
    ("Maulana Azad Medical College", "Delhi", "New Delhi", "Government", 4, "A+", 1958),
    ("Grant Medical College", "Maharashtra", "Mumbai", "Government", 20, "A", 1845),
    ("Kasturba Medical College Manipal", "Karnataka", "Mangalore", "Deemed", 9, "A++", 1953),
    ("St. Johns Medical College", "Karnataka", "Bangalore", "Private", 18, "A+", 1963),
    ("Lady Hardinge Medical College", "Delhi", "New Delhi", "Government", 11, "A+", 1916),
    ("Madras Medical College", "Tamil Nadu", "Chennai", "Government", 14, "A+", 1835),
    ("BJ Medical College", "Gujarat", "Ahmedabad", "Government", 22, "A", 1946),
    
    # Law colleges
    ("National Law School of India University", "Karnataka", "Bangalore", "Government", 1, "A++", 1987),
    ("National Academy of Legal Studies and Research", "Telangana", "Hyderabad", "Government", 2, "A++", 1998),
    ("National Law University Delhi", "Delhi", "New Delhi", "Government", 3, "A+", 2008),
    ("West Bengal National University of Juridical Sciences", "West Bengal", "Kolkata", "Government", 4, "A+", 1999),
    ("Gujarat National Law University", "Gujarat", "Gandhinagar", "Government", 5, "A+", 2003),
    ("National Law University Jodhpur", "Rajasthan", "Jodhpur", "Government", 6, "A", 1999),
    ("Symbiosis Law School", "Maharashtra", "Pune", "Deemed", 8, "A+", 1977),
    ("Faculty of Law - University of Delhi", "Delhi", "New Delhi", "Government", 7, "A+", 1924),
    ("ILS Law College", "Maharashtra", "Pune", "Private", 10, "A", 1924),
    ("Government Law College Mumbai", "Maharashtra", "Mumbai", "Government", 9, "A", 1855),
    
    # Management colleges
    ("Indian Institute of Management Ahmedabad", "Gujarat", "Ahmedabad", "Government", 1, "A++", 1961),
    ("Indian Institute of Management Bangalore", "Karnataka", "Bangalore", "Government", 2, "A++", 1973),
    ("Indian Institute of Management Calcutta", "West Bengal", "Kolkata", "Government", 3, "A++", 1961),
    ("Indian Institute of Management Lucknow", "Uttar Pradesh", "Lucknow", "Government", 4, "A++", 1984),
    ("Indian Institute of Management Kozhikode", "Kerala", "Kozhikode", "Government", 5, "A+", 1996),
    ("Indian Institute of Management Indore", "Madhya Pradesh", "Indore", "Government", 6, "A+", 1996),
    ("Faculty of Management Studies Delhi", "Delhi", "New Delhi", "Government", 8, "A+", 1954),
    ("XLRI Jamshedpur", "Jharkhand", "Jamshedpur", "Private", 7, "A++", 1949),
    ("SP Jain Institute of Management", "Maharashtra", "Mumbai", "Private", 10, "A+", 1981),
    ("MDI Gurgaon", "Haryana", "Gurugram", "Private", 9, "A+", 1973),
    ("NMIMS Mumbai", "Maharashtra", "Mumbai", "Deemed", 12, "A++", 1981),
    ("MICA Ahmedabad", "Gujarat", "Ahmedabad", "Private", 15, "A", 1991),
    ("IMT Ghaziabad", "Uttar Pradesh", "Noida", "Private", 18, "A", 1980),
    
    # Delhi University colleges
    ("St. Stephen's College", "Delhi", "New Delhi", "Private", None, "A+", 1881),
    ("Hindu College", "Delhi", "New Delhi", "Government", None, "A+", 1899),
    ("Lady Shri Ram College for Women", "Delhi", "New Delhi", "Private", None, "A++", 1956),
    ("Shri Ram College of Commerce", "Delhi", "New Delhi", "Government", None, "A+", 1926),
    ("Hansraj College", "Delhi", "New Delhi", "Government", None, "A+", 1948),
    ("Miranda House", "Delhi", "New Delhi", "Government", None, "A++", 1948),
    ("Kirori Mal College", "Delhi", "New Delhi", "Government", None, "A", 1954),
    ("Ramjas College", "Delhi", "New Delhi", "Government", None, "A", 1917),
    ("Daulat Ram College", "Delhi", "New Delhi", "Government", None, "A", 1960),
    ("Atma Ram Sanatan Dharma College", "Delhi", "New Delhi", "Government", None, "A", 1959),
    ("Gargi College", "Delhi", "South Delhi", "Government", None, "A", 1967),
    ("Jesus and Mary College", "Delhi", "New Delhi", "Private", None, "A+", 1968),
    ("Deshbandhu College", "Delhi", "New Delhi", "Government", None, "B++", 1952),
    ("Shaheed Bhagat Singh College", "Delhi", "New Delhi", "Government", None, "A", 1967),
    ("Sri Venkateswara College", "Delhi", "South Delhi", "Government", None, "A", 1961),
    
    # State engineering colleges
    ("College of Engineering Pune", "Maharashtra", "Pune", "Government", 40, "A", 1854),
    ("Jadavpur University Engineering", "West Bengal", "Kolkata", "Government", 20, "A+", 1955),
    ("PSG College of Technology", "Tamil Nadu", "Coimbatore", "Private", 45, "A", 1951),
    ("BMS College of Engineering", "Karnataka", "Bangalore", "Private", 55, "A", 1946),
    ("VJTI Mumbai", "Maharashtra", "Mumbai", "Government", 38, "A+", 1887),
    ("Netaji Subhas University of Technology", "Delhi", "New Delhi", "Government", 25, "A", 1983),
    ("Delhi Technological University", "Delhi", "New Delhi", "Government", 28, "A+", 1941),
    ("PEC Chandigarh", "Chandigarh", "Chandigarh", "Government", 42, "A", 1921),
    ("IIIT Hyderabad", "Telangana", "Hyderabad", "Deemed", 30, "A+", 1998),
    ("IIIT Bangalore", "Karnataka", "Bangalore", "Deemed", 35, "A+", 1999),
    ("IIIT Allahabad", "Uttar Pradesh", "Allahabad", "Deemed", 48, "A", 1999),
    ("IIIT Delhi", "Delhi", "New Delhi", "Government", 32, "A+", 2008),
    ("DAIICT Gandhinagar", "Gujarat", "Gandhinagar", "Private", 52, "A", 2001),
    ("ICT Mumbai", "Maharashtra", "Mumbai", "Government", 18, "A+", 1933),
    ("IISER Pune", "Maharashtra", "Pune", "Government", 12, "A++", 2006),
    ("IISER Kolkata", "West Bengal", "Kolkata", "Government", 15, "A+", 2006),
    ("IISER Mohali", "Punjab", "Chandigarh", "Government", 17, "A+", 2007),
    ("NISER Bhubaneswar", "Odisha", "Bhubaneswar", "Government", 22, "A", 2006),
    
    # More state universities and colleges
    ("Jamia Millia Islamia", "Delhi", "New Delhi", "Government", 20, "A++", 1920),
    ("Guru Gobind Singh Indraprastha University", "Delhi", "New Delhi", "Government", 55, "A", 1998),
    ("Amrita Vishwa Vidyapeetham", "Tamil Nadu", "Coimbatore", "Deemed", 6, "A++", 2003),
    ("Bharathiar University", "Tamil Nadu", "Coimbatore", "Government", 50, "A", 1982),
    ("Cochin University of Science and Technology", "Kerala", "Kochi", "Government", 45, "A", 1971),
    ("Mahatma Gandhi University", "Kerala", "Kochi", "Government", 55, "A", 1983),
    ("Andhra University", "Andhra Pradesh", "Visakhapatnam", "Government", 60, "A", 1926),
    ("Sri Venkateswara University", "Andhra Pradesh", "Tirupati", "Government", 65, "B++", 1954),
    ("University of Mysore", "Karnataka", "Mysore", "Government", 58, "A", 1916),
    ("Karnataka University", "Karnataka", "Hubli", "Government", 70, "B++", 1949),
    ("Gauhati University", "Assam", "Guwahati", "Government", 75, "A", 1948),
    ("North Eastern Hill University", "Manipur", "Imphal", "Government", 80, "B++", 1973),
    ("Tezpur University", "Assam", "Tezpur", "Government", 65, "A", 1994),
    ("Central University of Rajasthan", "Rajasthan", "Ajmer", "Government", 70, "A", 2009),
    ("Central University of Punjab", "Punjab", "Patiala", "Government", 72, "A", 2009),
    ("Central University of Haryana", "Haryana", "Hisar", "Government", 78, "B++", 2009),
    ("Central University of Gujarat", "Gujarat", "Gandhinagar", "Government", 68, "A", 2009),
    ("Central University of Kerala", "Kerala", "Thiruvananthapuram", "Government", 62, "A", 2009),
    ("Central University of Tamil Nadu", "Tamil Nadu", "Trichy", "Government", 73, "B++", 2009),
    ("Central University of Karnataka", "Karnataka", "Belgaum", "Government", 76, "B++", 2009),
    
    # Additional private/deemed
    ("Jamia Hamdard", "Delhi", "New Delhi", "Deemed", 50, "A", 1989),
    ("Graphic Era University", "Uttarakhand", "Dehradun", "Private", 85, "A", 2008),
    ("DIT University", "Uttarakhand", "Dehradun", "Private", 90, "B++", 1998),
    ("Sharda University", "Uttar Pradesh", "Noida", "Private", 75, "A", 2009),
    ("GD Goenka University", "Haryana", "Gurugram", "Private", 95, "B++", 2013),
    ("Manav Rachna University", "Haryana", "Faridabad", "Private", 80, "A", 2004),
    ("BML Munjal University", "Haryana", "Gurugram", "Private", 88, "B++", 2014),
    ("Chitkara University", "Punjab", "Patiala", "Private", 60, "A", 2002),
    ("Mahindra University", "Telangana", "Hyderabad", "Private", 70, "A", 2020),
    ("Plaksha University", "Punjab", "Chandigarh", "Private", 65, "A", 2019),
    ("Krea University", "Andhra Pradesh", "Tirupati", "Private", 75, "A", 2018),
    ("Azim Premji University", "Karnataka", "Bangalore", "Private", 50, "A+", 2010),
    ("Indian Statistical Institute", "West Bengal", "Kolkata", "Government", 8, "A++", 1931),
    ("Chennai Mathematical Institute", "Tamil Nadu", "Chennai", "Deemed", 25, "A+", 1989),
    ("Presidency University Kolkata", "West Bengal", "Kolkata", "Government", 40, "A", 2010),
]

# Courses data
COURSES_DATA = [
    # Engineering UG
    ("B.Tech Computer Science", "B.Tech CS", "UG", "Engineering", 4),
    ("B.Tech Electronics and Communication", "B.Tech ECE", "UG", "Engineering", 4),
    ("B.Tech Mechanical Engineering", "B.Tech ME", "UG", "Engineering", 4),
    ("B.Tech Electrical Engineering", "B.Tech EE", "UG", "Engineering", 4),
    ("B.Tech Civil Engineering", "B.Tech CE", "UG", "Engineering", 4),
    ("B.Tech Chemical Engineering", "B.Tech ChE", "UG", "Engineering", 4),
    ("B.Tech Information Technology", "B.Tech IT", "UG", "Engineering", 4),
    ("B.Tech Artificial Intelligence", "B.Tech AI", "UG", "Engineering", 4),
    ("B.Tech Data Science", "B.Tech DS", "UG", "Engineering", 4),
    ("B.Tech Biotechnology", "B.Tech BT", "UG", "Engineering", 4),
    
    # Engineering PG
    ("M.Tech Computer Science", "M.Tech CS", "PG", "Engineering", 2),
    ("M.Tech Electronics", "M.Tech EC", "PG", "Engineering", 2),
    ("M.Tech Mechanical", "M.Tech ME", "PG", "Engineering", 2),
    ("M.Tech Data Science", "M.Tech DS", "PG", "Engineering", 2),
    ("M.Tech AI and ML", "M.Tech AI", "PG", "Engineering", 2),
    
    # Science UG
    ("B.Sc Physics", "B.Sc Phy", "UG", "Science", 3),
    ("B.Sc Chemistry", "B.Sc Chem", "UG", "Science", 3),
    ("B.Sc Mathematics", "B.Sc Math", "UG", "Science", 3),
    ("B.Sc Biology", "B.Sc Bio", "UG", "Science", 3),
    ("B.Sc Computer Science", "B.Sc CS", "UG", "Science", 3),
    ("B.Sc Statistics", "B.Sc Stat", "UG", "Science", 3),
    
    # Science PG
    ("M.Sc Physics", "M.Sc Phy", "PG", "Science", 2),
    ("M.Sc Chemistry", "M.Sc Chem", "PG", "Science", 2),
    ("M.Sc Mathematics", "M.Sc Math", "PG", "Science", 2),
    ("M.Sc Data Science", "M.Sc DS", "PG", "Science", 2),
    
    # Commerce
    ("B.Com (Hons)", "B.Com H", "UG", "Commerce", 3),
    ("B.Com", "B.Com", "UG", "Commerce", 3),
    ("BBA", "BBA", "UG", "Commerce", 3),
    ("BBA Finance", "BBA Fin", "UG", "Commerce", 3),
    ("M.Com", "M.Com", "PG", "Commerce", 2),
    ("MBA", "MBA", "PG", "Commerce", 2),
    ("MBA Finance", "MBA Fin", "PG", "Commerce", 2),
    ("MBA Marketing", "MBA Mkt", "PG", "Commerce", 2),
    ("MBA HR", "MBA HR", "PG", "Commerce", 2),
    
    # Arts / Humanities
    ("BA English", "BA Eng", "UG", "Arts", 3),
    ("BA History", "BA Hist", "UG", "Arts", 3),
    ("BA Political Science", "BA PolSci", "UG", "Arts", 3),
    ("BA Economics", "BA Eco", "UG", "Arts", 3),
    ("BA Psychology", "BA Psy", "UG", "Arts", 3),
    ("BA Sociology", "BA Soc", "UG", "Arts", 3),
    ("BA Journalism", "BA JMC", "UG", "Arts", 3),
    ("MA English", "MA Eng", "PG", "Arts", 2),
    ("MA Economics", "MA Eco", "PG", "Arts", 2),
    ("MA Psychology", "MA Psy", "PG", "Arts", 2),
    
    # Medical
    ("MBBS", "MBBS", "UG", "Medical", 5.5),
    ("BDS", "BDS", "UG", "Medical", 5),
    ("B.Pharm", "B.Pharm", "UG", "Medical", 4),
    ("BAMS", "BAMS", "UG", "Medical", 5.5),
    ("BHMS", "BHMS", "UG", "Medical", 5.5),
    ("B.Sc Nursing", "B.Sc Nrs", "UG", "Medical", 4),
    ("MD General Medicine", "MD", "PG", "Medical", 3),
    ("MS Surgery", "MS", "PG", "Medical", 3),
    
    # Law
    ("BA LLB (Integrated)", "BA LLB", "UG", "Law", 5),
    ("BBA LLB (Integrated)", "BBA LLB", "UG", "Law", 5),
    ("LLB", "LLB", "UG", "Law", 3),
    ("LLM", "LLM", "PG", "Law", 2),
    
    # Design
    ("B.Des", "B.Des", "UG", "Design", 4),
    ("B.Arch", "B.Arch", "UG", "Design", 5),
    ("M.Des", "M.Des", "PG", "Design", 2),
    
    # PhD
    ("PhD Computer Science", "PhD CS", "PhD", "Engineering", 4),
    ("PhD Physics", "PhD Phy", "PhD", "Science", 4),
    ("PhD Chemistry", "PhD Chem", "PhD", "Science", 4),
    ("PhD Management", "PhD Mgmt", "PhD", "Commerce", 4),
    ("PhD Economics", "PhD Eco", "PhD", "Arts", 4),
]

# Entrance exams
EXAMS_DATA = [
    ("Joint Entrance Examination Main", "JEE_MAINS", "UG", "Engineering", "NTA"),
    ("Joint Entrance Examination Advanced", "JEE_ADVANCED", "UG", "Engineering", "IIT"),
    ("National Eligibility cum Entrance Test", "NEET", "UG", "Medical", "NTA"),
    ("Common University Entrance Test", "CUET", "UG", "Arts", "NTA"),
    ("CUET PG", "CUET_PG", "PG", "Arts", "NTA"),
    ("VIT Engineering Entrance Exam", "VITEEE", "UG", "Engineering", "VIT"),
    ("SRM Joint Engineering Entrance Exam", "SRMJEEE", "UG", "Engineering", "SRM"),
    ("BITS Admission Test", "BITSAT", "UG", "Engineering", "BITS"),
    ("Common Admission Test", "CAT", "PG", "Commerce", "IIM"),
    ("Xavier Aptitude Test", "XAT", "PG", "Commerce", "XLRI"),
    ("Management Aptitude Test", "MAT", "PG", "Commerce", "AIMA"),
    ("Common Law Admission Test", "CLAT", "UG", "Law", "Consortium of NLUs"),
    ("All India Law Entrance Test", "AILET", "UG", "Law", "NLU Delhi"),
    ("Graduate Aptitude Test in Engineering", "GATE", "PG", "Engineering", "IIT"),
    ("Joint Admission Test for MSc", "JAM", "PG", "Science", "IIT"),
    ("National Aptitude Test in Architecture", "NATA", "UG", "Design", "CoA"),
    ("Delhi University Entrance Test", "DUET", "UG", "Arts", "Delhi University"),
    ("IPU Common Entrance Test", "IPU_CET", "UG", "Engineering", "GGSIPU"),
    ("Maharashtra Common Entrance Test", "MHT_CET", "UG", "Engineering", "State of Maharashtra"),
    ("TS EAMCET", "TS_EAMCET", "UG", "Engineering", "JNTU Hyderabad"),
    ("AP EAMCET", "AP_EAMCET", "UG", "Engineering", "JNTU Kakinada"),
    ("KCET Karnataka", "KCET", "UG", "Engineering", "KEA"),
    ("WBJEE West Bengal", "WBJEE", "UG", "Engineering", "WBJEEB"),
    ("COMEDK UGET", "COMEDK", "UG", "Engineering", "COMEDK"),
    ("Manipal Entrance Test", "MET", "UG", "Engineering", "MAHE"),
    ("Amrita Entrance Exam", "AEEE", "UG", "Engineering", "Amrita"),
    ("KIITEE", "KIITEE", "UG", "Engineering", "KIIT"),
    ("UPSEE / AKTU", "UPSEE", "UG", "Engineering", "AKTU"),
    ("Symbiosis Entrance Test", "SET", "UG", "Commerce", "Symbiosis"),
    ("Christ University Entrance Test", "CUET_CHRIST", "UG", "Arts", "Christ University"),
    ("NEET PG", "NEET_PG", "PG", "Medical", "NBE"),
    ("LSAT India", "LSAT_INDIA", "UG", "Law", "LSAC"),
]


def get_fee_range(college_type, stream="Engineering"):
    """Generate realistic fee ranges based on college type."""
    if college_type == "Government":
        if stream in ["Engineering", "Medical"]:
            return (25000, 200000)
        return (5000, 50000)
    elif college_type == "Deemed":
        return (150000, 800000)
    else:  # Private
        return (200000, 2000000)


def get_admission_status():
    """Randomly assign admission status with realistic distribution."""
    r = random.random()
    if r < 0.25:
        return "Open"
    elif r < 0.40:
        return "Closing Soon"
    elif r < 0.55:
        return "Upcoming"
    elif r < 0.70:
        return "Counselling"
    elif r < 0.80:
        return "Spot Round"
    else:
        return "Closed"


def generate_additional_colleges(count=350):
    """Generate additional colleges to reach 500+ total."""
    additional = []
    
    college_name_prefixes = [
        "Government", "Sri", "Shri", "Dr.", "Mahatma", "Pandit", "Netaji",
        "Indira Gandhi", "Rajiv Gandhi", "Sardar Patel", "Swami Vivekananda",
    ]
    
    college_name_suffixes = [
        "College of Engineering", "Institute of Technology", "University",
        "College of Arts and Science", "College of Commerce",
        "Medical College", "Law College", "Institute of Management",
        "Engineering College", "College", "Polytechnic",
        "Institute of Science", "College of Education",
    ]
    
    private_names = [
        "Global Institute of Technology", "Excel Engineering College",
        "Heritage Institute", "Prestige University", "Apex College",
        "Pioneer Institute", "Modern College", "National Institute",
        "Premier Institute", "Royal College", "Imperial College",
        "Trinity College", "Fortune Institute", "Diamond Institute",
        "Platinum College", "Golden Engineering College",
        "Silver Jubilee College", "Millennium Institute",
        "New Era College", "Future Institute of Technology",
    ]
    
    for i in range(count):
        state = random.choice(STATES)
        city = random.choice(CITIES_BY_STATE.get(state, [state]))
        college_type = random.choices(
            ["Government", "Private", "Deemed", "Autonomous"],
            weights=[30, 40, 15, 15],
        )[0]
        
        if college_type == "Government":
            prefix = random.choice(college_name_prefixes)
            suffix = random.choice(college_name_suffixes)
            name = f"{prefix} {suffix}, {city}"
        elif college_type in ("Private", "Deemed"):
            name = f"{random.choice(private_names)}, {city}"
        else:
            name = f"{city} {random.choice(college_name_suffixes)}"
        
        nirf = random.randint(50, 200) if random.random() > 0.3 else None
        naac_grades = ["A++", "A+", "A", "B++", "B+", "B", None]
        naac_weights = [5, 10, 20, 25, 20, 15, 5]
        naac = random.choices(naac_grades, weights=naac_weights)[0]
        established = random.randint(1940, 2020)
        
        additional.append((name, state, city, college_type, nirf, naac, established))
    
    return additional


def seed_database():
    """Main seed function."""
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.execute(college_exams.delete())
        db.execute(college_courses.delete())
        db.query(Cutoff).delete()
        db.query(AdmissionRound).delete()
        db.query(College).delete()
        db.query(Course).delete()
        db.query(EntranceExam).delete()
        db.commit()
        
        print("🗑️  Cleared existing data")
        
        # Seed courses
        courses = []
        for name, short, level, stream, duration in COURSES_DATA:
            course = Course(
                name=name, short_name=short, level=level,
                stream=stream, duration_years=duration
            )
            db.add(course)
            courses.append(course)
        db.commit()
        print(f"📚 Added {len(courses)} courses")
        
        # Seed exams
        exams = []
        for name, short, level, stream, body in EXAMS_DATA:
            exam = EntranceExam(
                name=name, short_name=short, level=level,
                stream=stream, conducting_body=body
            )
            db.add(exam)
            exams.append(exam)
        db.commit()
        print(f"📝 Added {len(exams)} entrance exams")
        
        # Combine real + generated colleges
        all_colleges_data = REAL_COLLEGES + generate_additional_colleges(350)
        print(f"🏫 Seeding {len(all_colleges_data)} colleges...")
        
        for i, (name, state, city, ctype, nirf, naac, est) in enumerate(all_colleges_data):
            # Determine what kind of college this is
            name_lower = name.lower()
            is_iit = ("indian institute of technology" in name_lower or ("iit" in name_lower and "iiit" not in name_lower))
            is_nit = ("national institute of technology" in name_lower or "nit " in name_lower)
            is_iiit = "iiit" in name_lower or "indian institute of information" in name_lower
            is_bits = "bits" in name_lower
            is_engineering = is_iit or is_nit or is_iiit or is_bits or any(x in name_lower for x in ["engineering", "technology", "iiser"])
            is_medical = any(x in name_lower for x in ["medical", "aiims", "jipmer", "institute of medical"])
            is_law = any(x in name_lower for x in ["law", "juridical", "legal"])
            is_management = any(x in name_lower for x in ["management", "iim ", "indian institute of management", "business"])
            is_university = "university" in name_lower or "college" in name_lower
            
            # Fee range
            if is_engineering:
                stream = "Engineering"
            elif is_medical:
                stream = "Medical"
            else:
                stream = "General"
            
            fee_min, fee_max = get_fee_range(ctype, stream)
            # Add some randomness
            fee_min = int(fee_min * random.uniform(0.8, 1.2))
            fee_max = int(fee_max * random.uniform(0.8, 1.5))
            
            admission_status = get_admission_status()
            
            # Application dates
            now = datetime(2026, 6, 12)
            if admission_status == "Open":
                app_start = now - timedelta(days=random.randint(10, 60))
                app_end = now + timedelta(days=random.randint(5, 45))
            elif admission_status == "Closing Soon":
                app_start = now - timedelta(days=random.randint(30, 90))
                app_end = now + timedelta(days=random.randint(1, 7))
            elif admission_status == "Upcoming":
                app_start = now + timedelta(days=random.randint(5, 60))
                app_end = app_start + timedelta(days=random.randint(30, 60))
            else:
                app_start = now - timedelta(days=random.randint(60, 180))
                app_end = now - timedelta(days=random.randint(1, 30))
            
            total_seats = random.choice([60, 120, 180, 240, 300, 500, 800, 1000, 1500, 2000, 5000])
            
            college = College(
                name=name,
                short_name=name.split(",")[0] if "," in name else None,
                state=state,
                city=city,
                address=f"{city}, {state}, India",
                college_type=ctype,
                established_year=est,
                nirf_ranking=nirf,
                naac_grade=naac,
                website=f"https://www.{name.lower().replace(' ', '').replace(',', '')[:20]}.ac.in",
                description=f"{name} is a prestigious {ctype.lower()} institution established in {est}, located in {city}, {state}.",
                admission_status=admission_status,
                application_start_date=app_start,
                application_end_date=app_end,
                application_url=f"https://www.{name.lower().replace(' ', '').replace(',', '')[:20]}.ac.in/admissions",
                notification_pdf_url=None,
                fee_min=fee_min,
                fee_max=fee_max,
                total_seats=total_seats,
            )
            db.add(college)
            db.flush()
            
            # Assign courses
            assigned_courses = []
            if is_engineering:
                eng_courses = [c for c in courses if c.stream == "Engineering"]
                assigned_courses = random.sample(eng_courses, min(len(eng_courses), random.randint(4, 10)))
            elif is_medical:
                med_courses = [c for c in courses if c.stream == "Medical"]
                assigned_courses = random.sample(med_courses, min(len(med_courses), random.randint(2, 6)))
            elif is_law:
                law_courses = [c for c in courses if c.stream == "Law"]
                assigned_courses = random.sample(law_courses, min(len(law_courses), random.randint(2, 4)))
            elif is_management:
                mgmt_courses = [c for c in courses if c.stream == "Commerce" and c.level == "PG"]
                assigned_courses = random.sample(mgmt_courses, min(len(mgmt_courses), random.randint(2, 5)))
            else:
                # General university - mix of courses
                all_streams = ["Science", "Commerce", "Arts"]
                for s in all_streams:
                    stream_courses = [c for c in courses if c.stream == s]
                    assigned_courses.extend(
                        random.sample(stream_courses, min(len(stream_courses), random.randint(2, 5)))
                    )
            
            college.courses = assigned_courses
            
            # Assign exams
            assigned_exams = []
            if is_engineering:
                eng_exams = [e for e in exams if e.stream == "Engineering"]
                # IITs only accept JEE Advanced
                if is_iit:
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_ADVANCED", "GATE", "JAM"]]
                elif is_nit:
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "GATE", "JAM"]]
                elif is_iiit:
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "GATE"]]
                elif is_bits:
                    assigned_exams = [e for e in exams if e.short_name in ["BITSAT", "GATE"]]
                elif "vit" in name_lower or "vellore institute" in name_lower:
                    assigned_exams = [e for e in exams if e.short_name in ["VITEEE", "GATE"]]
                elif "srm" in name_lower:
                    assigned_exams = [e for e in exams if e.short_name in ["SRMJEEE", "GATE"]]
                elif "manipal" in name_lower:
                    assigned_exams = [e for e in exams if e.short_name in ["MET", "GATE"]]
                elif "amrita" in name_lower:
                    assigned_exams = [e for e in exams if e.short_name in ["AEEE", "GATE"]]
                elif "kiit" in name_lower:
                    assigned_exams = [e for e in exams if e.short_name in ["KIITEE", "GATE"]]
                elif state == "Maharashtra":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "MHT_CET", "GATE"]]
                elif state == "Karnataka":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "KCET", "COMEDK", "GATE"]]
                elif state == "West Bengal":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "WBJEE", "GATE"]]
                elif state == "Telangana":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "TS_EAMCET", "GATE"]]
                elif state == "Andhra Pradesh":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "AP_EAMCET", "GATE"]]
                elif state == "Uttar Pradesh":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "UPSEE", "GATE"]]
                elif state == "Delhi":
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "IPU_CET", "GATE"]]
                else:
                    assigned_exams = [e for e in exams if e.short_name in ["JEE_MAINS", "GATE"]]
            elif is_medical:
                assigned_exams = [e for e in exams if e.stream == "Medical"]
            elif is_law:
                assigned_exams = [e for e in exams if e.stream == "Law"]
            elif is_management:
                mgmt_exams = [e for e in exams if e.short_name in ["CAT", "XAT", "MAT"]]
                assigned_exams = random.sample(mgmt_exams, min(len(mgmt_exams), random.randint(1, 3)))
            else:
                gen_exams = [e for e in exams if e.short_name in ["CUET", "CUET_PG", "DUET"]]
                assigned_exams = random.sample(gen_exams, min(len(gen_exams), random.randint(1, 2)))
            
            college.exams_accepted = assigned_exams
            
            # Create cutoffs
            categories = ["General", "OBC", "SC", "ST", "EWS"]
            for exam in assigned_exams[:2]:  # Cutoffs for first 2 exams
                for cat in categories:
                    base_score = random.uniform(60, 99) if exam.short_name in ["JEE_MAINS", "BITSAT"] else random.uniform(400, 700)
                    # Category-wise relaxation
                    cat_factor = {"General": 1.0, "OBC": 0.95, "EWS": 0.97, "SC": 0.85, "ST": 0.80}
                    
                    cutoff = Cutoff(
                        college_id=college.id,
                        course_id=assigned_courses[0].id if assigned_courses else None,
                        exam_id=exam.id,
                        year=2025,
                        round_number=1,
                        category=cat,
                        cutoff_percentile=round(base_score * cat_factor.get(cat, 1.0), 2) if exam.short_name in ["JEE_MAINS"] else None,
                        cutoff_score=round(base_score * cat_factor.get(cat, 1.0), 1) if exam.short_name not in ["JEE_MAINS"] else None,
                        cutoff_rank=random.randint(100, 50000) if exam.short_name in ["JEE_ADVANCED", "NEET"] else None,
                    )
                    db.add(cutoff)
            
            # Create admission rounds
            rounds_count = random.randint(1, 4)
            for r in range(1, rounds_count + 1):
                round_start = app_start + timedelta(days=(r - 1) * 20)
                round_end = round_start + timedelta(days=15)
                
                round_status = "Closed" if round_end < now else ("Open" if round_start <= now <= round_end else "Upcoming")
                
                admission_round = AdmissionRound(
                    college_id=college.id,
                    round_name=f"Round {r}" if r <= 3 else "Spot Round",
                    round_number=r,
                    start_date=round_start,
                    end_date=round_end,
                    status=round_status,
                    description=f"{'Regular' if r <= 3 else 'Spot'} admission round {r}",
                )
                db.add(admission_round)
            
            if (i + 1) % 50 == 0:
                print(f"   ... seeded {i + 1} colleges")
        
        db.commit()
        print(f"\n✅ Successfully seeded {len(all_colleges_data)} colleges!")
        print(f"   📚 {len(courses)} courses")
        print(f"   📝 {len(exams)} entrance exams")
        print("   🎯 Cutoffs and admission rounds generated")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
