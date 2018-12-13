const _ = require("lodash");
const fs = require("fs");

const state_abbreviations = _.invert({
  AL: "Alabama",
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District Of Columbia",
  FM: "Federated States Of Micronesia",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MH: "Marshall Islands",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  MP: "Northern Mariana Islands",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PW: "Palau",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming"
});

// Copied from Wikipedia
const lines = `Alabama

    1. Bradley Byrne (R)
    2. Martha Roby (R)
    3. Mike Rogers (R)
    4. Robert Aderholt (R)
    5. Mo Brooks (R)
    6. Gary Palmer (R)
    7. Terri Sewell (D)

Alaska

    At-large. Don Young (R)

Arizona

    1. Tom O'Halleran (D)
    2. Ann Kirkpatrick (D)
    3. Raúl Grijalva (D)
    4. Paul Gosar (R)
    5. Andy Biggs (R)
    6. David Schweikert (R)
    7. Ruben Gallego (D)
    8. Debbie Lesko (R)
    9. Greg Stanton (D)

Arkansas

    1. Rick Crawford (R)
    2. French Hill (R)
    3. Steve Womack (R)
    4. Bruce Westerman (R)

California

    1. Doug LaMalfa (R)
    2. Jared Huffman (D)
    3. John Garamendi (D)
    4. Tom McClintock (R)
    5. Mike Thompson (D)
    6. Doris Matsui (D)
    7. Ami Bera (D)
    8. Paul Cook (R)
    9. Jerry McNerney (D)
    10. Josh Harder (D)
    11. Mark DeSaulnier (D)
    12. Nancy Pelosi (D)
    13. Barbara Lee (D)
    14. Jackie Speier (D)
    15. Eric Swalwell (D)
    16. Jim Costa (D)
    17. Ro Khanna (D)
    18. Anna Eshoo (D)
    19. Zoe Lofgren (D)
    20. Jimmy Panetta (D)
    21. TJ Cox (D)
    22. Devin Nunes (R)
    23. Kevin McCarthy (R)
    24. Salud Carbajal (D)
    25. Katie Hill (D)
    26. Julia Brownley (D)
    27. Judy Chu (D)
    28. Adam Schiff (D)
    29. Tony Cárdenas (D)
    30. Brad Sherman (D)
    31. Pete Aguilar (D)
    32. Grace Napolitano (D)
    33. Ted Lieu (D)
    34. Jimmy Gomez (D)
    35. Norma Torres (D)
    36. Raul Ruiz (D)
    37. Karen Bass (D)
    38. Linda Sánchez (D)
    39. Gil Cisneros (D)
    40. Lucille Roybal-Allard (D)
    41. Mark Takano (D)
    42. Ken Calvert (R)
    43. Maxine Waters (D)
    44. Nanette Barragán (D)
    45. Katie Porter (D)
    46. Lou Correa (D)
    47. Alan Lowenthal (D)
    48. Harley Rouda (D)
    49. Mike Levin (D)
    50. Duncan D. Hunter (R)
    51. Juan Vargas (D)
    52. Scott Peters (D)
    53. Susan Davis (D)

Colorado

    1. Diana DeGette (D)
    2. Joe Neguse (D)
    3. Scott Tipton (R)
    4. Ken Buck (R)
    5. Doug Lamborn (R)
    6. Jason Crow (D)
    7. Ed Perlmutter (D)

Connecticut

    1. John B. Larson (D)
    2. Joe Courtney (D)
    3. Rosa DeLauro (D)
    4. Jim Himes (D)
    5. Jahana Hayes (D)

Delaware

    At-large. Lisa Blunt Rochester (D)

Florida

    1. Matt Gaetz (R)
    2. Neal Dunn (R)
    3. Ted Yoho (R)
    4. John Rutherford (R)
    5. Al Lawson (D)
    6. Michael Waltz (R)
    7. Stephanie Murphy (D)
    8. Bill Posey (R)
    9. Darren Soto (D)
    10. Val Demings (D)
    11. Daniel Webster (R)
    12. Gus Bilirakis (R)
    13. Charlie Crist (D)
    14. Kathy Castor (D)
    15. Ross Spano (R)
    16. Vern Buchanan (R)
    17. Greg Steube (R)
    18. Brian Mast (R)
    19. Francis Rooney (R)
    20. Alcee Hastings (D)
    21. Lois Frankel (D)
    22. Ted Deutch (D)
    23. Debbie Wasserman Schultz (D)
    24. Frederica Wilson (D)
    25. Mario Diaz-Balart (R)
    26. Debbie Mucarsel-Powell (D)
    27. Donna Shalala (D)

Georgia

    1. Buddy Carter (R)
    2. Sanford Bishop (D)
    3. Drew Ferguson (R)
    4. Hank Johnson (D)
    5. John Lewis (D)
    6. Lucy McBath (D)
    7. Rob Woodall (R)
    8. Austin Scott (R)
    9. Doug Collins (R)
    10. Jody Hice (R)
    11. Barry Loudermilk (R)
    12. Rick W. Allen (R)
    13. David Scott (D)
    14. Tom Graves (R)

Hawaii

    1. Ed Case (D)
    2. Tulsi Gabbard (D)

Idaho

    1. Russ Fulcher (R)
    2. Mike Simpson (R)

Illinois

    1. Bobby Rush (D)
    2. Robin Kelly (D)
    3. Dan Lipinski (D)
    4. Jesús García (D)
    5. Mike Quigley (D)
    6. Sean Casten (D)
    7. Danny K. Davis (D)
    8. Raja Krishnamoorthi (D)
    9. Jan Schakowsky (D)
    10. Brad Schneider (D)
    11. Bill Foster (D)
    12. Mike Bost (R)
    13. Rodney Davis (R)
    14. Lauren Underwood (D)
    15. John Shimkus (R)
    16. Adam Kinzinger (R)
    17. Cheri Bustos (D)
    18. Darin LaHood (R)

Indiana

    1. Pete Visclosky (D)
    2. Jackie Walorski (R)
    3. Jim Banks (R)
    4. Jim Baird (R)
    5. Susan Brooks (R)
    6. Greg Pence (R)
    7. André Carson (D)
    8. Larry Bucshon (R)
    9. Trey Hollingsworth (R)

Iowa

    1. Abby Finkenauer (D)
    2. Dave Loebsack (D)
    3. Cindy Axne (D)
    4. Steve King (R)

Kansas

    1. Roger Marshall (R)
    2. Steve Watkins (R)
    3. Sharice Davids (D)
    4. Ron Estes (R)

Kentucky

    1. James Comer (R)
    2. Brett Guthrie (R)
    3. John Yarmuth (D)
    4. Thomas Massie (R)
    5. Hal Rogers (R)
    6. Andy Barr (R)

Louisiana

    1. Steve Scalise (R)
    2. Cedric Richmond (D)
    3. Clay Higgins (R)
    4. Mike Johnson (R)
    5. Ralph Abraham (R)
    6. Garret Graves (R)

Maine

    1. Chellie Pingree (D)
    2. Jared Golden (D)

Maryland

    1. Andy Harris (R)
    2. Dutch Ruppersberger (D)
    3. John Sarbanes (D)
    4. Anthony G. Brown (D)
    5. Steny Hoyer (D)
    6. David Trone (D)
    7. Elijah Cummings (D)
    8. Jamie Raskin (D)

Massachusetts

    1. Richard Neal (D)
    2. Jim McGovern (D)
    3. Lori Trahan (D)
    4. Joseph P. Kennedy III (D)
    5. Katherine Clark (D)
    6. Seth Moulton (D)
    7. Ayanna Pressley (D)
    8. Stephen F. Lynch (D)
    9. Bill Keating (D)

Michigan

    1. Jack Bergman (R)
    2. Bill Huizenga (R)
    3. Justin Amash (R)
    4. John Moolenaar (R)
    5. Dan Kildee (D)
    6. Fred Upton (R)
    7. Tim Walberg (R)
    8. Elissa Slotkin (D)
    9. Andy Levin (D)
    10. Paul Mitchell (R)
    11. Haley Stevens (D)
    12. Debbie Dingell (D)
    13. Rashida Tlaib (D)
    14. Brenda Lawrence (D)

Minnesota

    1. Jim Hagedorn (R)
    2. Angie Craig (D)
    3. Dean Phillips (D)
    4. Betty McCollum (D)
    5. Ilhan Omar (D)
    6. Tom Emmer (R)
    7. Collin Peterson (D)
    8. Pete Stauber (R)

Mississippi

    1. Trent Kelly (R)
    2. Bennie Thompson (D)
    3. Michael Guest (R)
    4. Steven Palazzo (R)

	
Missouri

    1. Lacy Clay (D)
    2. Ann Wagner (R)
    3. Blaine Luetkemeyer (R)
    4. Vicky Hartzler (R)
    5. Emanuel Cleaver (D)
    6. Sam Graves (R)
    7. Billy Long (R)
    8. Jason Smith (R)

Montana

    At-large. Greg Gianforte (R)

Nebraska

    1. Jeff Fortenberry (R)
    2. Don Bacon (R)
    3. Adrian Smith (R)

Nevada

    1. Dina Titus (D)
    2. Mark Amodei (R)
    3. Susie Lee (D)
    4. Steven Horsford (D)

New Hampshire

    1. Chris Pappas (D)
    2. Ann McLane Kuster (D)

New Jersey

    1. Donald Norcross (D)
    2. Jeff Van Drew (D)
    3. Andy Kim (D)
    4. Christopher Smith (R)
    5. Josh Gottheimer (D)
    6. Frank Pallone (D)
    7. Tom Malinowski (D)
    8. Albio Sires (D)
    9. Bill Pascrell (D)
    10. Donald Payne Jr. (D)
    11. Mikie Sherrill (D)
    12. Bonnie Watson Coleman (D)

New Mexico

    1. Deb Haaland (D)
    2. Xochitl Torres Small (D)
    3. Ben Ray Luján (D)

New York

    1. Lee Zeldin (R)
    2. Peter T. King (R)
    3. Thomas Suozzi (D)
    4. Kathleen Rice (D)
    5. Gregory Meeks (D)
    6. Grace Meng (D)
    7. Nydia Velázquez (D)
    8. Hakeem Jeffries (D)
    9. Yvette Clarke (D)
    10. Jerrold Nadler (D)
    11. Max Rose (D)
    12. Carolyn Maloney (D)
    13. Adriano Espaillat (D)
    14. Alexandria Ocasio-Cortez (D)
    15. José E. Serrano (D)
    16. Eliot Engel (D)
    17. Nita Lowey (D)
    18. Sean Patrick Maloney (D)
    19. Antonio Delgado (D)
    20. Paul Tonko (D)
    21. Elise Stefanik (R)
    22. Anthony Brindisi (D)
    23. Tom Reed (R)
    24. John Katko (R)
    25. Joseph D. Morelle (D)
    26. Brian Higgins (D)
    27. Chris Collins (R)

North Carolina

    1. G. K. Butterfield (D)
    2. George Holding (R)
    3. Walter B. Jones Jr. (R)
    4. David Price (D)
    5. Virginia Foxx (R)
    6. Mark Walker (R)
    7. David Rouzer (R)
    8. Richard Hudson (R)
    9. TBD (U)
    10. Patrick McHenry (R)
    11. Mark Meadows (R)
    12. Alma Adams (D)
    13. Ted Budd (R)

North Dakota

    At-large. Kelly Armstrong (R)

Ohio

    1. Steve Chabot (R)
    2. Brad Wenstrup (R)
    3. Joyce Beatty (D)
    4. Jim Jordan (R)
    5. Bob Latta (R)
    6. Bill Johnson (R)
    7. Bob Gibbs (R)
    8. Warren Davidson (R)
    9. Marcy Kaptur (D)
    10. Mike Turner (R)
    11. Marcia Fudge (D)
    12. Troy Balderson (R)
    13. Tim Ryan (D)
    14. David Joyce (R)
    15. Steve Stivers (R)
    16. Anthony Gonzalez (R)

Oklahoma

    1. Kevin Hern (R)
    2. Markwayne Mullin (R)
    3. Frank Lucas (R)
    4. Tom Cole (R)
    5. Kendra Horn (D)

Oregon

    1. Suzanne Bonamici (D)
    2. Greg Walden (R)
    3. Earl Blumenauer (D)
    4. Peter DeFazio (D)
    5. Kurt Schrader (D)

Pennsylvania

    1. Brian Fitzpatrick (R)
    2. Brendan Boyle (D)
    3. Dwight Evans (D)
    4. Madeleine Dean (D)
    5. Mary Gay Scanlon (D)
    6. Chrissy Houlahan (D)
    7. Susan Wild (D)
    8. Matt Cartwright (D)
    9. Dan Meuser (R)
    10. Scott Perry (R)
    11. Lloyd Smucker (R)
    12. Tom Marino (R)
    13. John Joyce (R)
    14. Guy Reschenthaler (R)
    15. Glenn Thompson (R)
    16. Mike Kelly (R)
    17. Conor Lamb (D)
    18. Michael F. Doyle (D)

Rhode Island

    1. David Cicilline (D)
    2. James Langevin (D)

South Carolina

    1. Joe Cunningham (D)
    2. Joe Wilson (R)
    3. Jeff Duncan (R)
    4. William Timmons (R)
    5. Ralph Norman (R)
    6. Jim Clyburn (D)
    7. Tom Rice (R)

South Dakota

    At-large. Dusty Johnson (R)

Tennessee

    1. Phil Roe (R)
    2. Tim Burchett (R)
    3. Chuck Fleischmann (R)
    4. Scott DesJarlais (R)
    5. Jim Cooper (D)
    6. John Rose (R)
    7. Mark E. Green (R)
    8. David Kustoff (R)
    9. Steve Cohen (D)

Texas

    1. Louie Gohmert (R)
    2. Dan Crenshaw (R)
    3. Van Taylor (R)
    4. John Ratcliffe (R)
    5. Lance Gooden (R)
    6. Ron Wright (R)
    7. Lizzie Fletcher (D)
    8. Kevin Brady (R)
    9. Al Green (D)
    10. Michael McCaul (R)
    11. Mike Conaway (R)
    12. Kay Granger (R)
    13. Mac Thornberry (R)
    14. Randy Weber (R)
    15. Vicente González (D)
    16. Veronica Escobar (D)
    17. Bill Flores (R)
    18. Sheila Jackson Lee (D)
    19. Jodey Arrington (R)
    20. Joaquín Castro (D)
    21. Chip Roy (R)
    22. Pete Olson (R)
    23. Will Hurd (R)
    24. Kenny Marchant (R)
    25. Roger Williams (R)
    26. Michael Burgess (R)
    27. Michael Cloud (R)
    28. Henry Cuellar (D)
    29. Sylvia Garcia (D)
    30. Eddie Bernice Johnson (D)
    31. John Carter (R)
    32. Colin Allred (D)
    33. Marc Veasey (D)
    34. Filemon Vela Jr. (D)
    35. Lloyd Doggett (D)
    36. Brian Babin (R)

Utah

    1. Rob Bishop (R)
    2. Chris Stewart (R)
    3. John Curtis (R)
    4. Ben McAdams (D)

Vermont

    At-large. Peter Welch (D)

Virginia

    1. Rob Wittman (R)
    2. Elaine Luria (D)
    3. Bobby Scott (D)
    4. Donald McEachin (D)
    5. Denver Riggleman (R)
    6. Ben Cline (R)
    7. Abigail Spanberger (D)
    8. Don Beyer (D)
    9. Morgan Griffith (R)
    10. Jennifer Wexton (D)
    11. Gerry Connolly (D)

Washington

    1. Suzan DelBene (D)
    2. Rick Larsen (D)
    3. Jaime Herrera Beutler (R)
    4. Dan Newhouse (R)
    5. Cathy McMorris Rodgers (R)
    6. Derek Kilmer (D)
    7. Pramila Jayapal (D)
    8. Kim Schrier (D)
    9. Adam Smith (D)
    10. Dennis Heck (D)

West Virginia

    1. David McKinley (R)
    2. Alex Mooney (R)
    3. Carol Miller (R)

Wisconsin

    1. Bryan Steil (R)
    2. Mark Pocan (D)
    3. Ron Kind (D)
    4. Gwen Moore (D)
    5. Jim Sensenbrenner (R)
    6. Glenn Grothman (R)
    7. Sean Duffy (R)
    8. Mike Gallagher (R)

Wyoming

    At-large. Liz Cheney (R)`
  .split("\n")
  .filter(line => line.trim() != "");

const states = {};
let current_state = null;
for (let line of lines) {
  if (line.match(/[0-9]/) || line.includes("large")) {
    const name = line
      .split(".")
      .slice(1, 10)
      .join(".")
      .split("(")[0]
      .trim();

    const party = line.split("(")[1].split(")")[0];
    states[current_state].push({ name, party });
  } else {
    current_state = line;
    states[current_state] = [];
  }
}

const congress = [];
for (let state in states) {
  states[state].forEach((member, idx) => {
    congress.push({
      district: `${state_abbreviations[state]}-${(states[state].length == 1
        ? 0
        : idx + 1
      )
        .toString()
        .padStart(2, "0")}`,
      name: member.name,
      party: member.party
    });
  });
}

fs.writeFileSync(
  "./jobs/dataset-pipeline/congress-116.json",
  JSON.stringify(congress, null, 2)
);
