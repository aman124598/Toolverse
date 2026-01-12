// Fake data generator utility
export class FakeDataGenerator {
  private firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
    'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
    'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
    'Alexander', 'Rachel', 'Patrick', 'Catherine', 'Frank', 'Carolyn', 'Jack', 'Janet',
    'Dennis', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane',
    'Jose', 'Virginia', 'Adam', 'Julie', 'Henry', 'Joyce', 'Nathan', 'Victoria',
    'Douglas', 'Olivia', 'Zachary', 'Kelly', 'Peter', 'Christina', 'Kyle', 'Lauren'
  ];

  private lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
    'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
    'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell'
  ];

  private streetNames = [
    'Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake',
    'Hill', 'Park', 'Walnut', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
    'Seventh', 'Eighth', 'Ninth', 'First', 'Lincoln', 'Sunset', 'Madison', 'Franklin',
    'Highland', 'Church', 'Spring', 'Market', 'Chestnut', 'Center', 'River', 'Forest',
    'Willow', 'Cherry', 'Lakeview', 'Hickory', 'Riverside', 'Liberty', 'Mill', 'Ridge',
    'Meadow', 'Valley', 'Pearl', 'Broadway', 'College', 'Grove', 'Warren', 'Jefferson'
  ];

  private streetTypes = [
    'Street', 'Avenue', 'Road', 'Boulevard', 'Drive', 'Lane', 'Way', 'Court',
    'Place', 'Circle', 'Parkway', 'Trail', 'Terrace'
  ];

  private cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
    'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
    'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'Nashville', 'Detroit', 'Portland',
    'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
    'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami',
    'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita', 'Arlington', 'Tampa', 'New Orleans'
  ];

  private states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  private emailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
    'gmx.com', 'inbox.com', 'live.com', 'msn.com', 'me.com'
  ];

  private getRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateName(): string {
    const firstName = this.getRandom(this.firstNames);
    const lastName = this.getRandom(this.lastNames);
    return `${firstName} ${lastName}`;
  }

  generateEmail(): string {
    const firstName = this.getRandom(this.firstNames).toLowerCase();
    const lastName = this.getRandom(this.lastNames).toLowerCase();
    const domain = this.getRandom(this.emailDomains);

    const formats = [
      `${firstName}.${lastName}`,
      `${firstName}${lastName}`,
      `${firstName}_${lastName}`,
      `${firstName}${Math.floor(Math.random() * 999)}`,
      `${lastName}.${firstName}`,
      `${firstName.charAt(0)}.${lastName}`
    ];

    const username = this.getRandom(formats);
    return `${username}@${domain}`;
  }

  generatePhone(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;

    const formats = [
      `(${areaCode}) ${exchange}-${number}`,
      `${areaCode}-${exchange}-${number}`,
      `${areaCode}.${exchange}.${number}`,
      `+1 ${areaCode} ${exchange} ${number}`
    ];

    return this.getRandom(formats);
  }

  generateAddress() {
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streetName = this.getRandom(this.streetNames);
    const streetType = this.getRandom(this.streetTypes);
    const city = this.getRandom(this.cities);
    const state = this.getRandom(this.states);
    const zip = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');

    return {
      street: `${streetNumber} ${streetName} ${streetType}`,
      city,
      state,
      zip,
      full: `${streetNumber} ${streetName} ${streetType}, ${city}, ${state} ${zip}`
    };
  }

  generateBulk(count: number = 1) {
    const results = [];

    for (let i = 0; i < count; i++) {
      const address = this.generateAddress();
      results.push({
        name: this.generateName(),
        email: this.generateEmail(),
        phone: this.generatePhone(),
        address: address.full,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip
      });
    }

    return results;
  }
}
