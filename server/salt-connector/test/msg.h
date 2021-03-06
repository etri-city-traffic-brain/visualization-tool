// protocol message between SALT and SALT-VIS

#define SIMULATION_ID_LENGTH 17;

struct MsgHeader {
  unsigned int type; // INIT(0), DATA(1), STATUS(2), SET(10), STOP(11)
  long timestamp; // milliseconds
}
// SALT-VIS -> SALT
struct SetMsg {
  MsgHeader header;
  float extend[4]; // minx, miny, maxx, maxy
  unsigned int roadType; // 0: link, 1: cell
}

// SALT-VIS --> SALT
struct StopMsg  {
  MsgHeader header;
}

// SALT-VIS --> SALT
struct InitMsg  {
  MsgHeader header;
  unsigned char[SIMULATION_ID_LENGTH] simulationId;
}

// SALT --> SALT-VIS
struct StatusMsg  {
  MsgHeader header;
  unsigned int status; // RUNNING(0), FINISHED(1), FAILURE(2)
  unsigned int progress; // 0 ~ 100
}

// SALT --> SALT-VIS
struct DataMsg  {
  MsgHeader header;
  unsigned int numRoads;
  Road roads[rumRoads]
}

struct Road  {
  unsigned int lenRoadId
  unsigned char roadId[lenRoadId]; // cellId or linkId
  unsigned int speed; // road's mean speed
  unsigned int numVehicles;
  unsigned char vehicles[numVehicles]; // SMALL(0), LARGE(1)
  unsigned char currentSignal; // RED(0), GREEN(1)
}
